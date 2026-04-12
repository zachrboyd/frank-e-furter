"use client";

import { useEffect, useRef } from "react";

const shortcuts = [
  { key: "j", desc: "Next lead" },
  { key: "k", desc: "Previous lead" },
  { key: "n", desc: "Next section" },
  { key: "?", desc: "Toggle this help" },
  { key: "Esc", desc: "Close this overlay" },
];

export default function KeyboardHelp({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && closeRef.current) {
      closeRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      // Trap focus inside modal
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="kbd-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="kbd-box">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-special-elite), cursive",
              color: "var(--blood)",
            }}
          >
            Keyboard Shortcuts
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-2xl leading-none cursor-pointer p-1"
            style={{ color: "var(--grease)" }}
            aria-label="Close keyboard shortcuts"
          >
            &times;
          </button>
        </div>
        <table className="w-full" role="presentation">
          <tbody>
            {shortcuts.map((s) => (
              <tr key={s.key} className="border-b border-[var(--silver)]">
                <td className="py-2 pr-4">
                  <span className="kbd-key">{s.key}</span>
                </td>
                <td
                  className="py-2 text-sm"
                  style={{
                    fontFamily: "var(--font-ibm-plex), sans-serif",
                    color: "var(--chalkboard)",
                  }}
                >
                  {s.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p
          className="mt-4 text-xs"
          style={{
            fontFamily: "var(--font-shadows), cursive",
            color: "var(--grease)",
          }}
        >
          Frank built this for keyboard warriors. Every interaction works without
          a mouse.
        </p>
      </div>
    </div>
  );
}
