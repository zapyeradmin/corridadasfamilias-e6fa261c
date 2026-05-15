import { useEffect, useState } from "react";
import { SITE } from "@/lib/site-config";

function diff(target: number) {
  const now = Date.now();
  const ms = Math.max(0, target - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms / 3600000) % 24);
  const minutes = Math.floor((ms / 60000) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function Countdown({ className = "" }: { className?: string }) {
  const target = new Date(SITE.eventDate).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const i = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(i);
  }, [target]);

  const cells: { label: string; value: number }[] = [
    { label: "Dias", value: t.days },
    { label: "Horas", value: t.hours },
    { label: "Min", value: t.minutes },
    { label: "Seg", value: t.seconds },
  ];

  return (
    <div className={`grid grid-cols-4 gap-2 sm:gap-4 ${className}`}>
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-white/15 bg-white/10 px-2 py-3 text-center backdrop-blur-md sm:px-4 sm:py-4"
        >
          <div className="heading-display text-3xl text-white sm:text-5xl">
            {String(c.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 sm:text-xs">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
