"use client";

import type { Lead } from "../types";
import FreshnessBadge from "./FreshnessBadge";
import SilktideCTA from "./SilktideCTA";

export default function VIPCard({ lead }: { lead: Lead }) {
  return (
    <article
      className="vip-card relative p-5 md:p-6"
      data-lead-id={lead.id}
      tabIndex={0}
      aria-label={`VIP Lead: ${lead.defendant}, ${lead.caseName}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-cabin-sketch), cursive",
              color: "var(--blood)",
            }}
          >
            {lead.defendant}
          </h3>
          <p className="text-sm" style={{ color: "var(--grease)" }}>
            {lead.industry} &mdash; {lead.website}
          </p>
        </div>
        <span className="enterprise-badge" style={{ fontFamily: "var(--font-permanent-marker), cursive" }}>
          {"\u2B50"} VIP INTAKE
        </span>
      </div>

      {lead.hasIronyBadge && (
        <span
          className="absolute top-12 right-6 text-xl cursor-help"
          title="Irony Alert: This defendant's website has detectable accessibility issues"
          aria-label="Irony badge: defendant website has accessibility issues"
        >
          {"\uD83C\uDFAF"}
        </span>
      )}

      <div
        className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-3"
        style={{ color: "var(--grease)" }}
      >
        <span>
          <span className="sr-only">Case: </span>
          {lead.caseName}
        </span>
        <span>
          <span className="sr-only">Court: </span>
          {lead.court}
        </span>
        <span>
          <span className="sr-only">Filed: </span>
          {lead.dateFiled}
        </span>
        <FreshnessBadge dateFiled={lead.dateFiled} />
      </div>

      <div className="mb-4 p-3 rounded" style={{ background: "rgba(45,80,22,0.08)" }}>
        <h4
          className="text-xs font-bold uppercase tracking-wide mb-1"
          style={{
            fontFamily: "var(--font-permanent-marker), cursive",
            color: "var(--pickle)",
          }}
        >
          Frank&apos;s Take
        </h4>
        <p
          className="text-base"
          style={{
            fontFamily: "var(--font-ibm-plex), sans-serif",
            color: "var(--chalkboard)",
            lineHeight: "1.6",
          }}
        >
          {lead.whyItMatters}
        </p>
      </div>

      {lead.briefTheAE && (
        <div className="mb-4 p-3 rounded" style={{ background: "rgba(45,80,22,0.08)" }}>
          <h4
            className="text-xs font-bold uppercase tracking-wide mb-1"
            style={{
              fontFamily: "var(--font-permanent-marker), cursive",
              color: "var(--pickle)",
            }}
          >
            Brief the AE
          </h4>
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-ibm-plex), sans-serif",
              color: "var(--chalkboard)",
              lineHeight: "1.6",
            }}
          >
            {lead.briefTheAE}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <SilktideCTA website={lead.website} />
      </div>

      <div className="mt-3 pt-2 border-t" style={{ borderColor: "var(--pickle)" }}>
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
          {"\uD83D\uDCCB"} View on CourtListener &mdash; {lead.docketNumber}
        </a>
      </div>
    </article>
  );
}
