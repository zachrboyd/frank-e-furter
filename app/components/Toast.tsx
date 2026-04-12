"use client";

import { useEffect } from "react";

export default function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="toast"
      role="status"
      aria-live="polite"
      style={{ fontFamily: "var(--font-permanent-marker), cursive" }}
    >
      {message}
    </div>
  );
}
