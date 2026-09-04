import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ResendConfig = {
  apiKey: string | null;
  fromEmail: string;
};

export type SendEmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

/**
 * Obtem as configuracoes do Resend (prioridade: banco settings -> variaveis de ambiente)
 */
export async function getResendConfig(): Promise<ResendConfig> {
  let dbKey: string | null = null;
  let dbFrom: string | null = null;

  try {
    const { data: rows } = await supabaseAdmin
      .from("settings")
      .select("key, value")
      .in("key", ["resend_api_key", "resend_from_email"]);

    for (const r of rows ?? []) {
      if (r.key === "resend_api_key" && typeof r.value === "string" && r.value.trim()) {
        dbKey = r.value.trim();
      }
      if (r.key === "resend_from_email" && typeof r.value === "string" && r.value.trim()) {
        dbFrom = r.value.trim();
      }
    }
  } catch (err) {
    console.warn("[resend] Nao foi possivel ler settings do banco:", err);
  }

  const apiKey = dbKey || process.env.RESEND_API_KEY || null;
  const fromEmail =
    dbFrom ||
    process.env.RESEND_FROM_EMAIL ||
    "2ª Edicao da Corrida Natalina <onboarding@resend.dev>";

  return { apiKey, fromEmail };
}

/**
 * Gera o texto puro e o HTML do e-mail de confirmacao de inscricao conforme o modelo oficial
 */
export function buildConfirmationEmailContent(params: {
  athleteName?: string;
  protocol?: string;
}) {
  const greeting = params.athleteName
    ? `Olá, ${params.athleteName.trim()}! 🏃‍♂️🏃‍♀️🎅`
    : "Olá, atleta! 🏃‍♂️🏃‍♀️🎅";

  const protocolLine = params.protocol ? `\nProtocolo da Inscrição: ${params.protocol}\n` : "";

  const text = `${greeting}

Sua inscrição na 2ª Edição da Corrida Natalina foi realizada com sucesso! 🎉
${protocolLine}
Agora precisamos apenas confirmar o seu pagamento para validar definitivamente a sua participação.

Caso o pagamento já tenha sido realizado, por favor, envie o comprovante de pagamento para um dos nossos canais de atendimento pelo WhatsApp:

📲 (87) 99201-7978 (Filipe Siqueira)
📲 (87) 98868-2053 (Joselma Gomes)

Após a confirmação, sua inscrição estará oficialmente validada.

Obrigado por fazer parte da 2ª Edição da Corrida Natalina. Nos vemos na largada! ❤️🎅🏃

Atenciosamente,
Equipe CORRE+
2ª Edição da Corrida Natalina`;

  const waMsgFilipe = encodeURIComponent(
    `Olá, Filipe! Segue meu comprovante de pagamento da inscrição ${params.protocol ? `(${params.protocol})` : ""} na 2ª Corrida Natalina.`,
  );
  const waMsgJoselma = encodeURIComponent(
    `Olá, Joselma! Segue meu comprovante de pagamento da inscrição ${params.protocol ? `(${params.protocol})` : ""} na 2ª Corrida Natalina.`,
  );

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmação de Inscrição | 2ª Edição da Corrida Natalina</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #3d0000; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(194, 5, 5, 0.08); border: 1px solid #fee2e2;">
          <tr>
            <td style="background-color: #c20505; padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">
                2ª Edição da Corrida Natalina
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; font-weight: 700; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; opacity: 0.95;">
                Corre + · 20 de Dezembro de 2026
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #c20505;">
                ${greeting}
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #3d0000;">
                Sua inscrição na <strong>2ª Edição da Corrida Natalina</strong> foi realizada com sucesso! 🎉
              </p>

              ${
                params.protocol
                  ? `<div style="margin: 20px 0; padding: 14px 18px; background-color: #fff1f2; border-left: 4px solid #c20505; border-radius: 8px;">
                      <p style="margin: 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #c20505;">Protocolo da Inscrição</p>
                      <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 900; color: #3d0000; letter-spacing: 1px;">${params.protocol}</p>
                    </div>`
                  : ""
              }

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #3d0000;">
                Agora precisamos apenas <strong>confirmar o seu pagamento</strong> para validar definitivamente a sua participação.
              </p>

              <div style="margin: 24px 0; padding: 20px; background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 12px;">
                <p style="margin: 0 0 14px 0; font-size: 15px; font-weight: 600; color: #3d0000;">
                  Caso o pagamento já tenha sido realizado, por favor, envie o comprovante de pagamento para um dos nossos canais de atendimento pelo WhatsApp:
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
                  <tr>
                    <td style="padding: 6px 0;">
                      <a href="https://wa.me/5587992017978?text=${waMsgFilipe}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 14px;" target="_blank">
                        📲 (87) 99201-7978 — Filipe Siqueira
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">
                      <a href="https://wa.me/5587988682053?text=${waMsgJoselma}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 14px;" target="_blank">
                        📲 (87) 98868-2053 — Joselma Gomes
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 15px; color: #3d0000;">
                Após a confirmação, sua inscrição estará oficialmente validada.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; font-weight: 600; color: #c20505;">
                Obrigado por fazer parte da 2ª Edição da Corrida Natalina. Nos vemos na largada! ❤️🎅🏃
              </p>

              <hr style="border: none; border-top: 1px solid #fee2e2; margin: 28px 0 20px 0;" />

              <p style="margin: 0; font-size: 14px; color: #64748b;">
                Atenciosamente,<br />
                <strong style="color: #c20505;">Equipe CORRE+</strong><br />
                2ª Edição da Corrida Natalina
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fff1f2; padding: 16px 24px; text-align: center; border-top: 1px solid #fee2e2;">
              <p style="margin: 0; font-size: 12px; color: #991b1b;">
                Este é um e-mail automático de confirmação de inscrição na 2ª Corrida Natalina | Corre +.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { text, html };
}

/**
 * Envia o e-mail de confirmacao de inscricao via API do Resend
 */
export async function sendRegistrationConfirmationEmail(params: {
  to: string;
  athleteName?: string;
  protocol?: string;
}): Promise<SendEmailResult> {
  const { to, athleteName, protocol } = params;

  if (!to || !to.includes("@")) {
    return { ok: false, error: "Destinatário de e-mail inválido." };
  }

  const { apiKey, fromEmail } = await getResendConfig();

  if (!apiKey) {
    console.warn(
      `[resend] RESEND_API_KEY não está configurada. E-mail de confirmação para ${to} (protocolo ${protocol}) não foi enviado.`,
    );
    return { ok: false, error: "RESEND_API_KEY não configurada no servidor." };
  }

  const subject = "✅ Confirmação de Inscrição | 2ª Edição da Corrida Natalina";
  const { text, html } = buildConfirmationEmailContent({ athleteName, protocol });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        text,
        html,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = (data as { message?: string })?.message || `Erro HTTP ${response.status}`;
      console.error(`[resend] Falha ao enviar e-mail para ${to}:`, errMsg);
      return { ok: false, error: errMsg };
    }

    const emailId = (data as { id?: string })?.id;
    console.log(`[resend] E-mail de confirmação enviado para ${to} (id: ${emailId}).`);
    return { ok: true, id: emailId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[resend] Exceção ao enviar e-mail para ${to}:`, message);
    return { ok: false, error: message };
  }
}

/**
 * Envia um e-mail de teste para validar a configuracao da API do Resend
 */
export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  return sendRegistrationConfirmationEmail({
    to,
    athleteName: "Atleta de Teste",
    protocol: "TEST-2026",
  });
}
