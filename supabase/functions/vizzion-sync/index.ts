import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GatewaySettings {
  public_key: string | null;
  secret_key: string | null;
  enabled: boolean;
}

async function loadGatewaySettings(): Promise<GatewaySettings | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await supabase
    .from("gateway_settings")
    .select("public_key, secret_key, enabled")
    .eq("provider", "vizzionpay")
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar configurações: ${error.message}`);
  return data as GatewaySettings | null;
}

function mapStatus(status: string): "awaiting" | "pending" | "paid" | "failed" | "refunded" | "canceled" | "expired" {
  switch (status) {
    case "COMPLETED":
    case "PAID":
      return "paid";
    case "FAILED":
    case "DECLINED":
      return "failed";
    case "REFUNDED":
    case "CHARGED_BACK":
      return "refunded";
    case "CANCELED":
    case "CANCELLED":
      return "canceled";
    case "EXPIRED":
      return "expired";
    default:
      return "pending";
  }
}

/**
 * Query a single transaction from VizzionPay by its transaction ID.
 * The VizzionPay API only supports querying by individual ID, not listing all.
 */
async function queryTransaction(
  settings: GatewaySettings,
  transactionId: string
): Promise<Record<string, unknown> | null> {
  const url = `https://app.vizzionpay.com.br/api/v1/gateway/transactions?id=${encodeURIComponent(transactionId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-public-key": settings.public_key!,
      "x-secret-key": settings.secret_key!,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.error(`VizzionPay query failed for ${transactionId}:`, data);
    return null;
  }

  const data = await response.json();
  return data as Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const transactionId = body.transactionId as string | undefined;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const settings = await loadGatewaySettings();
    if (!settings || !settings.enabled || !settings.public_key || !settings.secret_key) {
      return new Response(
        JSON.stringify({ error: "Gateway de pagamentos não configurado." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If a specific transaction ID is provided, query and update that one
    if (transactionId) {
      const txn = await queryTransaction(settings, transactionId);
      if (!txn) {
        return new Response(
          JSON.stringify({ error: `Transação ${transactionId} não encontrada na VizzionPay.` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const status = mapStatus((txn.status as string) ?? "PENDING");
      const { error: rpcErr } = await supabase.rpc("upsert_donation", {
        p_provider_payment_id: txn.id as string,
        p_amount: (txn.amount as number) ?? (txn.originalAmount as number) ?? 0,
        p_status: status,
        p_provider: "vizzionpay",
        p_paid_at: status === "paid" ? ((txn.payedAt as string) ?? new Date().toISOString()) : null,
        p_created_at: (txn.createdAt as string) ?? new Date().toISOString(),
      });

      if (rpcErr) {
        return new Response(
          JSON.stringify({ error: `Falha ao atualizar: ${rpcErr.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ synced: 1, transactionId, status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No transactionId: sync all existing donation records that have a provider_payment_id
    // This updates the status of all known transactions from VizzionPay
    const { data: existingDonations, error: fetchErr } = await supabase
      .from("donations")
      .select("id, provider_payment_id, status")
      .not("provider_payment_id", "is", null)
      .neq("provider", "manual");

    if (fetchErr) {
      return new Response(
        JSON.stringify({ error: `Falha ao buscar doações: ${fetchErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!existingDonations || existingDonations.length === 0) {
      return new Response(
        JSON.stringify({ synced: 0, message: "Nenhuma transação para sincronizar." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let synced = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const donation of existingDonations) {
      const txnId = donation.provider_payment_id;
      if (!txnId) continue;

      try {
        const txn = await queryTransaction(settings, txnId);
        if (!txn) {
          errors.push(`${txnId}: não encontrada`);
          continue;
        }

        const newStatus = mapStatus((txn.status as string) ?? "PENDING");
        const amount = (txn.amount as number) ?? (txn.originalAmount as number) ?? 0;

        const { error: rpcErr } = await supabase.rpc("upsert_donation", {
          p_provider_payment_id: txnId,
          p_amount: amount,
          p_status: newStatus,
          p_provider: "vizzionpay",
          p_paid_at: newStatus === "paid" ? ((txn.payedAt as string) ?? new Date().toISOString()) : null,
          p_created_at: (txn.createdAt as string) ?? new Date().toISOString(),
        });

        if (rpcErr) {
          errors.push(`${txnId}: ${rpcErr.message}`);
        } else {
          synced++;
          if (donation.status !== newStatus) updated++;
        }
      } catch (e) {
        errors.push(`${txnId}: ${e instanceof Error ? e.message : "erro"}`);
      }
    }

    return new Response(
      JSON.stringify({
        synced,
        updated,
        total: existingDonations.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro interno.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
