import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-corrida.png?w=600&quality=88&format=webp";

export function HeaderLogo() {
  return (
    <Link to="/" className="relative flex items-center" aria-label="II Corrida das Famílias">
      <img
        src={logo}
        alt="II Corrida das Famílias"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        width={1247}
        height={385}
        className="h-[4.5rem] w-auto md:h-[5.25rem]"
      />
    </Link>
  );
}
