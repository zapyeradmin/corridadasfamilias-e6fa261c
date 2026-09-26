import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Assina alteracoes em tempo real na tabela public.registrations
 * para invalidar automaticamente os dados de inscricoes no painel admin
 * (lista, detalhes e metricas).
 */
export function useRegistrationsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channelName = `registrations-changes-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "registrations"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "registration"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "kpis"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "financial"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "registrations"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "registration"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "kpis"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "financial"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "financial"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
