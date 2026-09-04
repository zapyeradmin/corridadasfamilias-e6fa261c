import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getEmailSettingsAdmin,
  updateEmailSettingsAdmin,
  sendTestEmailAdmin,
} from "@/lib/admin.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export function TabEmail() {
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [fromEmailInput, setFromEmailInput] = useState("");
  const [testEmailInput, setTestEmailInput] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "email-settings"],
    queryFn: async () => {
      const res = await getEmailSettingsAdmin();
      if (!isInitialized && res) {
        setFromEmailInput(res.fromEmail || "2ª Edição da Corrida Natalina <onboarding@resend.dev>");
        setIsInitialized(true);
      }
      return res;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await updateEmailSettingsAdmin({
        data: {
          apiKey: apiKeyInput ? apiKeyInput.trim() : undefined,
          fromEmail: fromEmailInput.trim(),
        },
      });
    },
    onSuccess: () => {
      toast.success("Configurações de e-mail atualizadas com sucesso!");
      setApiKeyInput("");
      queryClient.invalidateQueries({ queryKey: ["admin", "email-settings"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erro ao salvar configurações.";
      toast.error(msg);
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async (to: string) => {
      return await sendTestEmailAdmin({ data: { to } });
    },
    onSuccess: (res) => {
      toast.success(`E-mail de teste enviado com sucesso! ID: ${res.id}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Falha ao enviar e-mail de teste.";
      toast.error(msg);
    },
  });

  const hasConfiguredKey = settings?.hasApiKey;

  return (
    <div className="space-y-6">
      {/* Card Principal: Configurações do Resend */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#c20505]">
                <Mail className="h-5 w-5 text-[#c20505]" />
                Integração de E-mails com Resend
              </CardTitle>
              <CardDescription>
                Configure as credenciais da API do Resend para envio automático dos e-mails de confirmação de inscrição.
              </CardDescription>
            </div>
            {hasConfiguredKey ? (
              <Badge className="bg-emerald-600 text-white self-start sm:self-auto gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                API Key Ativa
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 self-start sm:self-auto gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                Chave Não Configurada
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Campo Chave de API */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="resend_api_key" className="text-sm font-semibold text-[#3d0000]">
                Chave da API do Resend (RESEND_API_KEY)
              </Label>
              {settings?.apiKeyMasked && (
                <span className="text-xs text-muted-foreground">
                  Atual: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{settings.apiKeyMasked}</code>
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="resend_api_key"
                type={showApiKey ? "text" : "password"}
                placeholder={hasConfiguredKey ? "Digite uma nova chave para alterar (ex: re_123...)" : "Cole sua chave da API do Resend (ex: re_123...)"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave gratuita criando uma conta em{" "}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="underline text-[#c20505] font-semibold inline-flex items-center gap-0.5"
              >
                resend.com/api-keys <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Campo Remetente */}
          <div className="space-y-2">
            <Label htmlFor="resend_from_email" className="text-sm font-semibold text-[#3d0000]">
              Remetente dos E-mails (From)
            </Label>
            <Input
              id="resend_from_email"
              type="text"
              placeholder="2ª Edição da Corrida Natalina <onboarding@resend.dev>"
              value={fromEmailInput}
              onChange={(e) => setFromEmailInput(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Para testes use: <code className="bg-muted px-1 rounded">2ª Edição da Corrida Natalina &lt;onboarding@resend.dev&gt;</code>. Para envio público, adicione seu domínio verificado no Resend (ex: <code className="bg-muted px-1 rounded">2ª Edição da Corrida Natalina &lt;contato@corridascorremais.com.br&gt;</code>).
            </p>
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || isLoading}
            className="bg-[#c20505] hover:bg-[#930202] text-white font-bold"
          >
            {saveMutation.isPending ? "Salvando..." : "Salvar Configurações de E-mail"}
          </Button>
        </CardContent>
      </Card>

      {/* Card de Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#3d0000]">
            <Send className="h-5 w-5 text-[#c20505]" />
            Testar Envio de E-mail
          </CardTitle>
          <CardDescription>
            Envie um e-mail de teste para verificar se o Resend está autorizado e entregando as mensagens com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Digite seu e-mail para receber o teste..."
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                if (!testEmailInput || !testEmailInput.includes("@")) {
                  toast.error("Por favor, digite um e-mail válido para o teste.");
                  return;
                }
                testEmailMutation.mutate(testEmailInput.trim());
              }}
              disabled={testEmailMutation.isPending || !hasConfiguredKey}
              variant="outline"
              className="border-[#c20505] text-[#c20505] hover:bg-[#c20505] hover:text-white font-bold"
            >
              {testEmailMutation.isPending ? "Enviando..." : "Enviar Teste Agora"}
            </Button>
          </div>
          {!hasConfiguredKey && (
            <p className="text-xs text-amber-700 mt-2">
              ⚠️ Configure e salve uma chave da API do Resend acima para habilitar o envio de testes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card de Visualização do Modelo Oficial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#3d0000]">
            Modelo Oficial do E-mail de Confirmação
          </CardTitle>
          <CardDescription>
            Este é o conteúdo exato que o participante recebe automaticamente assim que conclui o formulário de inscrição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
            <div className="border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assunto Oficial:</span>
              <p className="font-bold text-[#c20505] text-base mt-0.5">
                ✅ Confirmação de Inscrição | 2ª Edição da Corrida Natalina
              </p>
            </div>

            <div className="space-y-3 text-sm text-[#3d0000] leading-relaxed">
              <p className="font-semibold">Olá, atleta! 🏃‍♂️🏃‍♀️🎅</p>
              
              <p>Sua inscrição na 2ª Edição da Corrida Natalina foi realizada com sucesso! 🎉</p>
              
              <p>Agora precisamos apenas confirmar o seu pagamento para validar definitivamente a sua participação.</p>
              
              <p className="font-medium">
                Caso o pagamento já tenha sido realizado, por favor, envie o comprovante de pagamento para um dos nossos canais de atendimento pelo WhatsApp:
              </p>

              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>📲 (87) 99201-7978 (Filipe Siqueira)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>📲 (87) 98868-2053 (Joselma Gomes)</span>
                </div>
              </div>

              <p>Após a confirmação, sua inscrição estará oficialmente validada.</p>

              <p className="font-semibold text-[#c20505]">
                Obrigado por fazer parte da 2ª Edição da Corrida Natalina. Nos vemos na largada! ❤️🎅🏃
              </p>

              <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <p>Atenciosamente,</p>
                <p className="font-bold text-[#c20505]">Equipe CORRE+</p>
                <p>2ª Edição da Corrida Natalina</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
