import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook reutilizável para acompanhar a sessão atual e o papel de admin.
 * Centraliza a lógica antes duplicada no header e em outros componentes.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRole(userId: string) {
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (active) setIsAdmin(!!role);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user;
      setIsAuthenticated(!!user);
      if (user) loadRole(user.id);
      else setIsAdmin(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setIsAuthenticated(!!user);
      if (user) loadRole(user.id);
      else setIsAdmin(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAuthenticated, isAdmin };
}
