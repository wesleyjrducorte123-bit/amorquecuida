import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PixChargeRequest {
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorDocument: string;
  message?: string;
  isAnonymous?: boolean;
}

interface GatewaySettings {
  public_key: string | null;
  secret_key: string | null;
  webhook_url: string | null;
  enabled: boolean;
}

async function loadGatewaySettings(): Promise<GatewaySettings | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await supabase
    .from("gateway_settings")
    .select("public_key, secret_key, webhook_url, enabled")
    .eq("provider", "vizzionpay")
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar configurações: ${error.message}`);
  return data as GatewaySettings | null;
}

async function createPixCharge(
  settings: GatewaySettings,
  body: PixChargeRequest
): Promise<{
  transactionId: string;
  pixCode: string;
  pixImage: string | null;
  expiresAt: string | null;
  status: string;
}> {
  const identifier = crypto.randomUUID();

  const payload: Record<string, unknown> = {
    identifier,
    amount: body.amount,
    client: {
      name: body.isAnonymous ? "Doador Anônimo" : body.donorName,
      email: body.donorEmail,
      phone: body.donorPhone,
      document: body.donorDocument,
    },
    products: [
      {
        id: "donation",
        name: "Doação - Salve Africa",
        quantity: 1,
        price: body.amount,
      },
    ],
    metadata: {
      provider: "site",
      source: "donation-modal",
      ...(body.message ? { message: body.message } : {}),
      ...(body.isAnonymous ? { anonymous: "true" } : {}),
    },
  };

  if (settings.webhook_url) {
    payload.callbackUrl = settings.webhook_url;
  }

  const response = await fetch(
    "https://app.vizzionpay.com.br/api/v1/gateway/pix/receive",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": settings.public_key!,
        "x-secret-key": settings.secret_key!,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const errMsg =
      data?.message || data?.errorDescription || "Erro ao criar cobrança PIX.";
    const details = data?.details ? ` Detalhes: ${JSON.stringify(data.details)}` : "";
    const fullResponse = data?.details ? ` ${JSON.stringify(data)}` : "";
    throw new Error(`VizzionPay: ${errMsg}${details}${fullResponse}`);
  }

  return {
    transactionId: data.transactionId ?? data.id ?? data.transaction?.id ?? identifier,
    pixCode: data.pix?.code ?? data.pixCode ?? data.pix_code ?? data.code ?? "",
    pixImage: data.pix?.image ?? data.pixImage ?? data.qrCodeImage ?? data.image ?? null,
    expiresAt: data.pix?.expiresAt ?? data.expiresAt ?? data.expirationDate ?? null,
    status: data.status ?? data.transaction?.status ?? "PENDING",
  };
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

    const body: PixChargeRequest = await req.json();

    if (!body.amount || body.amount < 5) {
      return new Response(
        JSON.stringify({ error: "Valor mínimo para doação é R$ 5,00." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.donorEmail) {
      return new Response(
        JSON.stringify({ error: "E-mail do doador é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.donorPhone) {
      return new Response(
        JSON.stringify({ error: "Telefone do doador é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.donorDocument) {
      return new Response(
        JSON.stringify({ error: "CPF ou CNPJ do doador é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const settings = await loadGatewaySettings();
    if (!settings || !settings.enabled || !settings.public_key || !settings.secret_key) {
      return new Response(
        JSON.stringify({ error: "Gateway de pagamentos não configurado. Peça ao administrador para configurar as chaves da VizzionPay no painel." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await createPixCharge(settings, body);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro interno do servidor.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
