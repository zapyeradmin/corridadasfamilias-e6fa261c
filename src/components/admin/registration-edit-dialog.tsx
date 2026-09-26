import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRegistrationDetail, updateRegistrationAdmin } from "@/lib/admin.functions";
import { CATEGORY_OPTIONS } from "@/lib/registrations.functions";
import { maskCpf, maskPhone } from "@/lib/cpf";
import { Loader2, Save } from "lucide-react";

const SHIRT_SIZES = [
  { value: "PP", label: "PP" },
  { value: "P", label: "P" },
  { value: "M", label: "M" },
  { value: "G", label: "G" },
  { value: "GG", label: "GG" },
  { value: "XGG", label: "XGG" },
] as const;

const GENDERS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
] as const;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "processing", label: "Processando" },
  { value: "paid", label: "Pago" },
  { value: "canceled", label: "Cancelado" },
  { value: "refunded", label: "Reembolsado" },
] as const;

export function RegistrationEditDialog({
  id,
  open,
  onOpenChange,
  onSaved,
}: {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const qc = useQueryClient();
  const fetchDetail = useServerFn(getRegistrationDetail);
  const updateReg = useServerFn(updateRegistrationAdmin);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "registration", id],
    queryFn: () => fetchDetail({ data: { id: id! } }),
    enabled: !!id && open,
  });

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [category, setCategory] = useState<string>("");
  const [shirtSize, setShirtSize] = useState<string>("M");
  const [status, setStatus] = useState<
    "pending" | "processing" | "paid" | "canceled" | "refunded"
  >("pending");
  const [amountCents, setAmountCents] = useState<number>(0);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const reg = data?.registration;

  useEffect(() => {
    if (reg && open) {
      setFullName(reg.full_name ?? "");
      setCpf(maskCpf(reg.cpf ?? ""));
      setEmail(reg.email ?? "");
      setWhatsapp(maskPhone(reg.whatsapp ?? ""));
      const rawDate = reg.birth_date ? reg.birth_date.split("T")[0] : "";
      setBirthDate(rawDate);
      setGender(reg.gender === "F" ? "F" : "M");
      setCategory(reg.category ?? "");
      setShirtSize(reg.shirt_size ? reg.shirt_size.toUpperCase() : "M");
      setStatus(
        (reg.status as "pending" | "processing" | "paid" | "canceled" | "refunded") ?? "pending",
      );
      setAmountCents(reg.amount_cents ?? 0);
      setEmergencyName(reg.emergency_contact_name ?? "");
      setEmergencyPhone(maskPhone(reg.emergency_contact_phone ?? ""));
      setMedicalNotes(reg.medical_notes ?? "");
    }
  }, [reg, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return await updateReg({
        data: {
          id,
          full_name: fullName.trim(),
          cpf: cpf.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          birth_date: birthDate.trim(),
          gender,
          shirt_size: shirtSize as any,
          category: category.trim(),
          emergency_contact_name: emergencyName.trim(),
          emergency_contact_phone: emergencyPhone.trim(),
          medical_notes: medicalNotes.trim() ? medicalNotes.trim() : null,
          status,
          amount_cents: amountCents,
        },
      });
    },
    onSuccess: () => {
      toast.success("Inscrição atualizada com sucesso!");
      qc.invalidateQueries({ queryKey: ["admin", "registrations"] });
      qc.invalidateQueries({ queryKey: ["admin", "registration", id] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      onSaved?.();
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar inscrição.";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Informe o nome completo.");
      return;
    }
    if (!cpf.trim() || cpf.replace(/\\D/g, "").length < 11) {
      toast.error("Informe um CPF válido.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    if (!whatsapp.trim() || whatsapp.replace(/\\D/g, "").length < 10) {
      toast.error("Informe um WhatsApp válido com DDD.");
      return;
    }
    if (!birthDate.trim()) {
      toast.error("Informe a data de nascimento.");
      return;
    }
    if (!category.trim()) {
      toast.error("Selecione a categoria.");
      return;
    }
    if (!emergencyName.trim()) {
      toast.error("Informe o nome do contato de emergência.");
      return;
    }
    if (!emergencyPhone.trim() || emergencyPhone.replace(/\\D/g, "").length < 8) {
      toast.error("Informe o telefone do contato de emergência.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold uppercase tracking-tight text-[#c20505]">
            Editar Inscrição do Atleta
          </DialogTitle>
          <DialogDescription className="text-xs">
            {reg ? `Protocolo: ${reg.protocol}` : "Carregando dados da inscrição..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && !reg ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#c20505]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Nome Completo *</Label>
                <Input
                  id="edit-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome do atleta"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-cpf">CPF *</Label>
                <Input
                  id="edit-cpf"
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-email">E-mail *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="atleta@exemplo.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-whatsapp">WhatsApp *</Label>
                <Input
                  id="edit-whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
                  placeholder="(87) 99999-9999"
                  maxLength={15}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-birth">Data de Nascimento *</Label>
                <Input
                  id="edit-birth"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-gender">Gênero *</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as "M" | "F")}>
                  <SelectTrigger id="edit-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-shirt">Tamanho da Camisa *</Label>
                <Select value={shirtSize} onValueChange={setShirtSize}>
                  <SelectTrigger id="edit-shirt">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIRT_SIZES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status">Status da Inscrição *</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((st) => (
                      <SelectItem key={st.value} value={st.value}>
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-amount">Valor (R$)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={(amountCents / 100).toFixed(2)}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    setAmountCents(isNaN(parsed) ? 0 : Math.round(parsed * 100));
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-emg-phone">Telefone de Emergência *</Label>
                <Input
                  id="edit-emg-phone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(maskPhone(e.target.value))}
                  placeholder="(87) 98888-8888"
                  maxLength={15}
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-emg-name">Nome do Contato de Emergência *</Label>
                <Input
                  id="edit-emg-name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Nome do parente ou responsável"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-medical">Observações Médicas (Alergias, medicamentos, etc.)</Label>
                <Textarea
                  id="edit-medical"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Nenhuma restrição médica conhecida."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-[#c20505] text-white hover:bg-[#a30404]"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando alterações...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
