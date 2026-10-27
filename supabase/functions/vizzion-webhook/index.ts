import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WebhookPayload {
  event: string;
  token: string;
  transaction: {
    id: string;
    identifier: string;
    status: string;
    paymentMethod: string;
    amount: number;
    originalAmount: number;
    currency: string;
    createdAt: string;
    payedAt: string | null;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    cnpj: string;
  };
}

async function loadWebhookToken(): Promise<string | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await supabase
    .from("gateway_settings")
    .select("webhook_token")
    .eq("provider", "vizzionpay")
    .maybeSingle();

  if (error) {
    console.error("Failed to load webhook token:", error.message);
    return null;
  }
  return data?.webhook_token ?? null;
}

function mapStatus(status: string): "pending" | "paid" | "failed" | "refunded" {
  switch (status) {
    case "COMPLETED":
      return "paid";
    case "FAILED":
      return "failed";
    case "REFUNDED":
    case "CHARGED_BACK":
      return "refunded";
    default:
      return "pending";
  }
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

    const payload: WebhookPayload = await req.json();

    const expectedToken = await loadWebhookToken();
    if (!expectedToken) {
      console.error("No webhook token configured");
      return new Response(
        JSON.stringify({ error: "Token não configurado." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (payload.token !== expectedToken) {
      console.error("Invalid webhook token");
      return new Response(
        JSON.stringify({ error: "Token inválido." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validEvents = [
      "TRANSACTION_PAID",
      "TRANSACTION_CREATED",
      "TRANSACTION_CANCELED",
      "TRANSACTION_REFUNDED",
      "TRANSACTION_CHARGED_BACK",
    ];
    if (!validEvents.includes(payload.event)) {
      return new Response(
        JSON.stringify({ received: true, ignored: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const txn = payload.transaction;
    const status = mapStatus(txn.status);
    const donorName = payload.client.name || null;
    const donorEmail = payload.client.email || null;

    // Check if a donation with this provider_payment_id already exists (idempotency)
    const { data: existing } = await supabase
      .from("donations")
      .select("id, status")
      .eq("provider_payment_id", txn.id)
      .maybeSingle();

    if (existing) {
      // Update status if changed
      if (existing.status !== status) {
        const updateData: Record<string, unknown> = { status };
        if (status === "paid" && txn.payedAt) {
          updateData.paid_at = txn.payedAt;
        }
        await supabase.from("donations").update(updateData).eq("id", existing.id);
      }
      return new Response(
        JSON.stringify({ received: true, updated: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new donation record
    await supabase.from("donations").insert({
      donor_name: donorName,
      donor_email: donorEmail,
      amount: txn.originalAmount || txn.amount,
      currency: txn.currency || "BRL",
      status,
      provider: "vizzionpay",
      provider_payment_id: txn.id,
      is_anonymous: false,
      created_at: txn.createdAt,
      paid_at: status === "paid" ? (txn.payedAt ?? new Date().toISOString()) : null,
    });

    return new Response(
      JSON.stringify({ received: true, created: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro interno.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
