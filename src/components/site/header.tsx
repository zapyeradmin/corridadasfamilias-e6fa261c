import { useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { HeaderLogo } from "./header/header-logo";
import { HeaderDecorations } from "./header/header-decorations";
import { DesktopNav } from "./header/desktop-nav";
import { MobileMenu } from "./header/mobile-menu";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const navigate = useNavigate();
  const qc = useQueryClient();

  function handleLogout() {
    setOpen(false);
    navigate({ to: "/", replace: true });
    toast.success("Você saiu da conta.");
    supabase.auth.signOut().then(() => {
      qc.clear();
      router.invalidate();
    });
  }

  return (
    <header className="sticky top-0 z-40 isolate bg-[#2a0f4a]/70 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[#2a0f4a]/55">
      <div className="relative w-full">
        <HeaderDecorations />
        <div className="relative mx-auto flex max-w-[1360px] items-center justify-between px-5 py-0 md:px-8">
          <HeaderLogo />
          <DesktopNav
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
          <button
            aria-label="Abrir menu"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <MobileMenu
        open={open}
        isAuthenticated={isAuthenticated}
        onClose={() => setOpen(false)}
        onLogout={handleLogout}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
    </header>
  );
}
