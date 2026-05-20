import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-corrida.png";

export function HeaderLogo() {
  return (
    <Link to="/" className="relative flex items-center" aria-label="II Corrida das Famílias">
      <img
        src={logo}
        alt="II Corrida das Famílias"
        loading="eager"
        decoding="async"
        className="h-12 w-auto md:h-14"
      />
    </Link>
  );
}
