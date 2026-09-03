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
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setT(diff(target));
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
    <div className={`grid grid-cols-4 gap-2 sm:gap-2.5 ${className}`}>
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex flex-col items-center justify-center rounded-xl border border-white/15 bg-white/10 px-1 py-3 text-center backdrop-blur-md sm:rounded-2xl sm:px-2 sm:py-3.5"
        >
          <div className="heading-display text-2xl font-black leading-none tracking-tight text-white tabular-nums sm:text-3xl lg:text-[2rem]">
            {String(c.value).padStart(2, "0")}
          </div>
          <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 sm:text-[11px] sm:tracking-[0.2em]">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
