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

function mapEventType(status: string): string {
  switch (status) {
    case "paid":
      return "payment_confirmed";
    case "failed":
      return "payment_failed";
    case "canceled":
      return "canceled";
    case "expired":
      return "expired";
    default:
      return "payment_confirmed";
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

    // If a webhook token is configured, validate it strictly.
    // If no token is configured yet, accept the webhook but log a warning
    // so payments are not lost while the admin sets up the token.
    if (expectedToken) {
      if (payload.token !== expectedToken) {
        console.error("Invalid webhook token");
        return new Response(
          JSON.stringify({ error: "Token inválido." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.warn("Webhook received without token validation — configure webhook_token in gateway settings.");
    }

    const validEvents = [
      "TRANSACTION_PAID",
      "TRANSACTION_CREATED",
      "TRANSACTION_CANCELED",
      "TRANSACTION_REFUNDED",
      "TRANSACTION_CHARGED_BACK",
      "TRANSACTION_EXPIRED",
      "TRANSACTION_FAILED",
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
    const donorPhone = payload.client.phone || null;
    const donorDocument = payload.client.cpf || payload.client.cnpj || null;

    // Upsert the donation record (idempotent by provider_payment_id)
    const { data: upserted, error: upsertErr } = await supabase.rpc("upsert_donation", {
      p_provider_payment_id: txn.id,
      p_donor_name: donorName,
      p_donor_email: donorEmail,
      p_donor_phone: donorPhone,
      p_donor_document: donorDocument,
      p_amount: txn.originalAmount || txn.amount,
      p_status: status,
      p_provider: "vizzionpay",
      p_paid_at: status === "paid" ? (txn.payedAt ?? new Date().toISOString()) : null,
      p_created_at: txn.createdAt,
    });

    if (upsertErr) {
      console.error("Failed to upsert donation:", upsertErr.message);
    }

    // Log the event (idempotent — event is always logged, deduplicated by donation_id + event_type at query time)
    if (upserted) {
      const eventType = mapEventType(status);
      await supabase.from("donation_events").insert({
        donation_id: upserted.id,
        event_type: eventType,
        amount: txn.originalAmount || txn.amount,
        metadata: { transactionId: txn.id, rawEvent: payload.event },
      });
    }

    return new Response(
      JSON.stringify({ received: true, updated: true }),
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

