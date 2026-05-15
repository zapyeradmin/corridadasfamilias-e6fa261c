import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-gradient-hero text-white">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--color-brand-orange)]">
            {eyebrow}
          </p>
        )}
        <h1 className="heading-display mt-3 text-4xl text-white sm:text-6xl md:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function ContentSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24 ${className}`}>
      {children}
    </section>
  );
}
