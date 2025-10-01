"use client";

import React, { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Countdown({ target }: { target: Date | null }) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const text = useMemo(() => {
    if (!target) return "—";
    return formatRemaining(target.getTime() - now.getTime());
  }, [target, now]);

  return <span>{text}</span>;
}
