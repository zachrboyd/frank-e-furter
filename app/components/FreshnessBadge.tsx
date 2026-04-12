"use client";

import { useEffect, useState } from "react";

function getHoursSince(dateStr: string): number {
  const filed = new Date(dateStr + "T12:00:00Z");
  return Math.max(0, (Date.now() - filed.getTime()) / (1000 * 60 * 60));
}

function getFreshness(hours: number): {
  label: string;
  className: string;
  emoji: string;
} {
  if (hours < 48)
    return { label: "JUST DROPPED", className: "badge-hot", emoji: "\uD83D\uDD25" };
  if (hours < 168)
    return { label: "STILL HOT", className: "badge-warm", emoji: "\uD83C\uDF36\uFE0F" };
  return { label: "COOLING DOWN", className: "badge-cool", emoji: "\u23F1\uFE0F" };
}

function formatHours(hours: number): string {
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FreshnessBadge({ dateFiled }: { dateFiled: string }) {
  const [hours, setHours] = useState(() => getHoursSince(dateFiled));

  useEffect(() => {
    const interval = setInterval(() => {
      setHours(getHoursSince(dateFiled));
    }, 60000);
    return () => clearInterval(interval);
  }, [dateFiled]);

  const { label, className, emoji } = getFreshness(hours);

  return (
    <span
      className={`${className} inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold`}
      style={{ fontFamily: "var(--font-permanent-marker), cursive" }}
      aria-label={`Filed ${formatHours(hours)}, status: ${label}`}
    >
      <span aria-hidden="true">{emoji}</span> {label}{" "}
      <span className="font-normal" style={{ fontFamily: "var(--font-shadows), cursive", fontSize: "11px" }}>
        ({formatHours(hours)})
      </span>
    </span>
  );
}
