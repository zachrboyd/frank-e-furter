"use client";

import type { Lead } from "../types";
import ConfidenceBadge from "./ConfidenceBadge";
import FreshnessBadge from "./FreshnessBadge";
import SilktideCTA from "./SilktideCTA";

export default function LeadCard({
  lead,
  index,
  stagger,
}: {
  lead: Lead;
  index: number;
  stagger?: boolean;
}) {
  const staggerClass =
    stagger && index % 2 === 0
      ? "stagger-odd"
      : stagger && index % 2 === 1
        ? "stagger-even"
        : "";

  return (
    <article
      className={`lead-card card-texture relative p-4 md:p-5 ${staggerClass}`}
      data-lead-id={lead.id}
      tabIndex={0}
      aria-label={`Lead: ${lead.defendant}, ${lead.caseName}`}
    >
      <ConfidenceBadge score={lead.confidenceScore} index={index} />

      {lead.hasIronyBadge && (
        <span
          className="irony-badge"
          title="Irony Alert: This defendant's website has detectable accessibility issues"
          aria-label="Irony badge: defendant website has accessibility issues"
        >
          {"\uD83C\uDFAF"}
        </span>
      )}

      <div className="ml-[76px]">
        <h3
          className="text-lg font-bold mb-1"
          style={{
            fontFamily: "var(--font-cabin-sketch), cursive",
            color: "var(--blood)",
          }}
        >
          {lead.defendant}
        </h3>

        <div
          className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2"
          style={{ color: "var(--grease)" }}
        >
          <span>
            <span aria-hidden="true">{"\uD83D\uDCCD"}</span>{" "}
            <span className="sr-only">Court: </span>
            {lead.court}
          </span>
          <span>
            <span aria-hidden="true">{"\uD83D\uDC68\u200D\u2696\uFE0F"}</span>{" "}
            <span className="sr-only">Plaintiff: </span>
            {lead.plaintiff}
          </span>
          <FreshnessBadge dateFiled={lead.dateFiled} />
        </div>

        <div className="mb-3">
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{
              fontFamily: "var(--font-permanent-marker), cursive",
              color: "var(--pickle, var(--grease))",
            }}
          >
            Frank&apos;s Take
          </span>
          <p
            className="text-base mt-1"
            style={{
              fontFamily: "var(--font-ibm-plex), sans-serif",
              color: "var(--chalkboard)",
              lineHeight: "1.6",
            }}
          >
            {lead.whyItMatters}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-2">
          <SilktideCTA website={lead.website} />
        </div>

        {/* How Frank Found This - transparency footer */}
        <div className="mt-3 pt-2 border-t border-[var(--silver)]">
          <a
            href={lead.docketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{
              color: "var(--grease)",
              fontFamily: "var(--font-shadows), cursive",
            }}
          >
            {"\uD83D\uDCCB"} View on CourtListener &mdash;{" "}
            {lead.docketNumber}
          </a>
        </div>
      </div>
    </article>
  );
}
