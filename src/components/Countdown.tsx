"use client";
import { useEffect, useState } from "react";

export default function Countdown({ target }: { target: Date | null }) {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!target) return <span className="opacity-60">—</span>;

  const diff = +target - +now;
  if (diff <= 0) return <span>0s</span>;
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return <span>{h}h {m}m {ss}s</span>;
}
