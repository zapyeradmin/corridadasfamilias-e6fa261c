import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to realtime changes on public.sponsors and invalidate the
 * shared ["sponsors"] query so every consumer (home grid, marquee,
 * /patrocinadores page) refetches automatically when an admin
 * adds/edits/removes a sponsor.
 */
export function useSponsorsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("public:sponsors")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sponsors" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sponsors"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
