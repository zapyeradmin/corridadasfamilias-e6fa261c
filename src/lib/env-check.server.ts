// Verificação de variáveis de ambiente críticas no boot do servidor Node (VPS).
// Falha cedo (com mensagem clara) se algo essencial estiver faltando.
// É invocado a partir de src/start.ts — só roda no servidor.

type EnvSpec = {
  name: string;
  required: boolean;
  // Onde a var é usada — só para mensagem de erro.
  usedFor: string;
};

const SPEC: EnvSpec[] = [
  // Supabase server (admin) — obrigatórias para qualquer server function/rota.
  { name: "SUPABASE_URL", required: true, usedFor: "Supabase admin client" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, usedFor: "Supabase admin client (bypass RLS)" },
  { name: "SUPABASE_PUBLISHABLE_KEY", required: true, usedFor: "Supabase server-side leitura pública" },

  // Cliente — bundled em build time, mas precisam existir no momento do build.
  { name: "VITE_SUPABASE_URL", required: true, usedFor: "Supabase client (browser)" },
  { name: "VITE_SUPABASE_PUBLISHABLE_KEY", required: true, usedFor: "Supabase client (browser)" },

  // URL pública — usada para montar redirect_url do checkout InfinitePay.
  { name: "PUBLIC_SITE_URL", required: true, usedFor: "Redirect/webhook callbacks (InfinitePay)" },

  // Opcionais, mas avisamos se faltarem.
  { name: "INFINITEPAY_WEBHOOK_SECRET", required: false, usedFor: "Verificação da assinatura do webhook InfinitePay" },
  { name: "LOVABLE_API_KEY", required: false, usedFor: "Lovable AI Gateway (somente se usado em server functions)" },
];

let didRun = false;

export function verifyServerEnv(): void {
  if (didRun) return;
  didRun = true;

  // Só faz sentido em runtime de servidor Node. Pula em build/SSR-de-prerender.
  if (typeof process === "undefined" || !process.env) return;

  const missingRequired: EnvSpec[] = [];
  const missingOptional: EnvSpec[] = [];

  for (const spec of SPEC) {
    const value = process.env[spec.name];
    if (!value || value.trim() === "") {
      (spec.required ? missingRequired : missingOptional).push(spec);
    }
  }

  if (missingOptional.length > 0) {
    console.warn(
      "[env-check] Variáveis opcionais ausentes (algumas features podem não funcionar):\n" +
        missingOptional.map((s) => `  - ${s.name}  (${s.usedFor})`).join("\n"),
    );
  }

  if (missingRequired.length > 0) {
    const message =
      "[env-check] FALHA — variáveis de ambiente obrigatórias ausentes:\n" +
      missingRequired.map((s) => `  - ${s.name}  (${s.usedFor})`).join("\n") +
      "\n\nPreencha o arquivo .env (use .env.production.example como referência) e reinicie a app.";
    console.error(message);
    // NODE_ENV=production na VPS → derruba o processo para PM2 reiniciar e o erro virar visível.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variables. See logs above.");
    }
  } else {
    console.log("[env-check] OK — todas as variáveis de ambiente obrigatórias estão presentes.");
  }
}
