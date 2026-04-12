"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SeedData } from "../types";
import LeadCard from "./LeadCard";
import VIPCard from "./VIPCard";
import SectionHeader from "./SectionHeader";
import KeyboardHelp from "./KeyboardHelp";
import Toast from "./Toast";

const QUIPS = [
  "Fresh out of the fryer. Zero markup, all lawsuit.",
  "Your website got sued yesterday. Statistically, it'll happen again tomorrow.",
  "We don't sell hope. We sell evidence.",
  "The internet is briefly accessible. Enjoy it while it lasts.",
  "If your website isn't accessible, someone's lawyer is already drafting.",
];

const SECTIONS = ["specials", "vip", "butchers"];

export default function FrankApp({ data }: { data: SeedData }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [quip] = useState(() => QUIPS[Math.floor(Math.random() * QUIPS.length)]);
  const leadRefs = useRef<HTMLElement[]>([]);
  const focusedIndex = useRef(-1);

  const regularLeads = data.leads
    .filter((l) => !l.enterprise)
    .sort(
      (a, b) =>
        new Date(b.dateFiled).getTime() - new Date(a.dateFiled).getTime()
    );

  const enterpriseLeads = data.leads
    .filter((l) => l.enterprise)
    .sort(
      (a, b) =>
        new Date(b.dateFiled).getTime() - new Date(a.dateFiled).getTime()
    );

  const sortedDistricts = [...data.districtStats].sort(
    (a, b) => b.cases - a.cases
  );

  // Collect all lead card refs
  useEffect(() => {
    leadRefs.current = Array.from(
      document.querySelectorAll("[data-lead-id]")
    ) as HTMLElement[];
  }, []);

  const focusLead = useCallback((direction: 1 | -1) => {
    const cards = leadRefs.current;
    if (cards.length === 0) return;
    focusedIndex.current = Math.max(
      0,
      Math.min(cards.length - 1, focusedIndex.current + direction)
    );
    cards[focusedIndex.current]?.focus();
    cards[focusedIndex.current]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const focusNextSection = useCallback(() => {
    const currentY = window.scrollY;
    for (const sectionId of SECTIONS) {
      const el = document.getElementById(sectionId);
      if (el && el.offsetTop > currentY + 100) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    // Wrap around to first section
    document.getElementById(SECTIONS[0])?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Global keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if (helpOpen && e.key !== "Escape" && e.key !== "?") return;

      switch (e.key) {
        case "j":
          e.preventDefault();
          focusLead(1);
          break;
        case "k":
          e.preventDefault();
          focusLead(-1);
          break;
        case "n":
          e.preventDefault();
          focusNextSection();
          break;
        case "?":
          e.preventDefault();
          setHelpOpen((o) => !o);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [helpOpen, focusLead, focusNextSection]);

  const lastUpdated = new Date(data.lastUpdated).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <>
      {/* Sticky Nav */}
      <nav className="sticky-nav" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <span
            className="text-sm font-bold tracking-wide hidden md:inline"
            style={{
              fontFamily: "var(--font-bungee), cursive",
              color: "var(--mustard)",
              fontSize: "13px",
            }}
          >
            FRANK E. FURTER&apos;S
          </span>
          <div className="flex items-center gap-1 md:gap-2" role="list">
            <a href="#specials" className="nav-link text-sm" role="listitem">
              Today&apos;s Specials
            </a>
            <span aria-hidden="true" style={{ color: "var(--silver)" }}>|</span>
            <a href="#vip" className="nav-link text-sm" role="listitem">
              VIP Counter
            </a>
            <span aria-hidden="true" style={{ color: "var(--silver)" }}>|</span>
            <a href="#butchers" className="nav-link text-sm" role="listitem">
              Butcher&apos;s Block
            </a>
          </div>
          <button
            onClick={() => setHelpOpen(true)}
            className="nav-link text-xs border border-[var(--silver)] rounded px-2 py-1"
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <span className="kbd-key text-xs">?</span> Keys
          </button>
        </div>
      </nav>

      {/* Masthead */}
      <header className="text-center py-10 md:py-16 px-4">
        <h1
          className="text-3xl md:text-5xl tracking-wide mb-3"
          style={{
            fontFamily: "var(--font-bungee), cursive",
            color: "var(--butcher-cream)",
            letterSpacing: "3px",
          }}
        >
          FRANK E. FURTER&apos;S
          <br />
          LEAD DOGS &amp; DOG LEADS
        </h1>
        <p
          className="text-lg md:text-xl mb-4"
          style={{
            fontFamily: "var(--font-shadows), cursive",
            color: "var(--mustard)",
            fontStyle: "italic",
          }}
        >
          Serving piping hot leads since April 2026
        </p>
        <div
          className="text-sm mb-4"
          style={{
            fontFamily: "var(--font-ibm-plex), sans-serif",
            color: "var(--silver)",
          }}
        >
          <strong style={{ color: "var(--mustard)" }}>
            {data.leads.length} leads
          </strong>{" "}
          served this week &nbsp;|&nbsp; Last updated: {lastUpdated}
        </div>
        <p
          className="max-w-xl mx-auto text-sm"
          style={{
            fontFamily: "var(--font-shadows), cursive",
            color: "var(--silver)",
            fontStyle: "italic",
          }}
        >
          &ldquo;{quip}&rdquo;
        </p>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 pb-16">
        {/* Section 1: TODAY'S SPECIALS */}
        <section aria-labelledby="specials-heading" className="mb-12">
          <SectionHeader
            id="specials"
            title="TODAY'S SPECIALS"
            color="var(--mustard)"
          />
          <p
            id="specials-heading"
            className="sr-only"
          >
            Today&apos;s Specials: Fresh website accessibility lawsuit leads
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {regularLeads.map((lead, i) => (
              <LeadCard key={lead.id} lead={lead} index={i} stagger />
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* Section 2: THE VIP COUNTER */}
        <section
          aria-labelledby="vip-heading"
          className="mb-12 py-8 px-4 md:px-8 rounded"
          style={{ background: "var(--butcher-cream)" }}
        >
          <SectionHeader
            id="vip"
            title="THE VIP COUNTER"
            color="var(--blood)"
            emoji={"\u2B50"}
          />
          <p id="vip-heading" className="sr-only">
            VIP Counter: Enterprise accounts with recent lawsuits
          </p>
          <p
            className="mb-6 text-sm"
            style={{
              fontFamily: "var(--font-shadows), cursive",
              color: "var(--grease)",
              fontStyle: "italic",
            }}
          >
            One of YOUR named accounts just took a hit. These are the
            enterprise targets where the buying trigger is live right now.
          </p>
          <div className="grid grid-cols-1 gap-6">
            {enterpriseLeads.map((lead) => (
              <VIPCard key={lead.id} lead={lead} />
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* Section 3: THE BUTCHER'S BLOCK */}
        <section aria-labelledby="butchers-heading" className="mb-12">
          <SectionHeader
            id="butchers"
            title="THE BUTCHER'S BLOCK"
            color="var(--ketchup)"
            emoji={"\uD83D\uDD2A"}
          />
          <p id="butchers-heading" className="sr-only">
            The Butcher&apos;s Block: Pattern intelligence and market landscape
          </p>

          {/* Serial Filer Watch */}
          <div className="mb-8">
            <h3
              className="text-lg uppercase tracking-wide mb-3"
              style={{
                fontFamily: "var(--font-special-elite), cursive",
                color: "var(--butcher-cream)",
              }}
            >
              Serial Filer Watch &mdash; Who&apos;s Suing This Month
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.serialFilers.map((filer) => (
                <div
                  key={filer.name}
                  className="card-texture p-4 rounded"
                  style={{
                    border: "2px solid var(--silver)",
                    borderRadius: "3px",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className="font-bold"
                      style={{
                        fontFamily: "var(--font-cabin-sketch), cursive",
                        color: "var(--blood)",
                        fontSize: "16px",
                      }}
                    >
                      {filer.name}
                    </h4>
                    <span
                      className="badge-hot px-2 py-1 rounded text-xs font-bold"
                      style={{
                        fontFamily: "var(--font-permanent-marker), cursive",
                      }}
                    >
                      {filer.casesThisMonth} cases
                    </span>
                  </div>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-ibm-plex), sans-serif",
                      color: "var(--grease)",
                    }}
                  >
                    Targets: {filer.typicalTargets}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{
                      fontFamily: "var(--font-shadows), cursive",
                      color: "var(--grease)",
                    }}
                  >
                    Courts: {filer.courts.join(", ")}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="mt-3 text-xs"
              style={{
                fontFamily: "var(--font-shadows), cursive",
                color: "var(--silver)",
                fontStyle: "italic",
              }}
            >
              Trend: 2 mega-filers (Knowles + Alvear) account for ~60% of all
              filings this month.
            </p>
          </div>


          {/* District Heat Map */}
          <div>
            <h3
              className="text-lg uppercase tracking-wide mb-3"
              style={{
                fontFamily: "var(--font-special-elite), cursive",
                color: "var(--butcher-cream)",
              }}
            >
              District Heat Map &mdash; Where the Lawsuits Are
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDistricts.map((dist, i) => (
                <div
                  key={dist.courtId}
                  className="card-texture p-4 rounded flex items-center justify-between"
                  style={{
                    border: "2px solid var(--silver)",
                    borderRadius: "3px",
                  }}
                >
                  <div>
                    <span
                      className="text-sm font-bold"
                      style={{
                        fontFamily: "var(--font-cabin-sketch), cursive",
                        color: "var(--blood)",
                      }}
                    >
                      #{i + 1} {dist.court}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-bold ${i === 0 ? "badge-hot" : i < 3 ? "badge-warm" : "badge-cool"}`}
                    style={{
                      fontFamily: "var(--font-permanent-marker), cursive",
                    }}
                  >
                    {dist.cases}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 px-4"
        style={{ borderColor: "rgba(184,184,184,0.3)" }}
        role="contentinfo"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{
                fontFamily: "var(--font-special-elite), cursive",
                color: "var(--mustard)",
              }}
            >
              About Frank
            </h2>
            <p
              className="text-xs leading-relaxed"
              style={{
                fontFamily: "var(--font-ibm-plex), sans-serif",
                color: "var(--silver)",
              }}
            >
              Frank E. Furter&apos;s Lead Dogs and Dog Leads is Zach
              Boyd&apos;s show-up artifact for an interview with Silktide
              (April 14, 2026). Every lead is from CourtListener&apos;s RECAP
              database of federal court dockets. Every lead is hand-reviewed.
              Not a product. Not affiliated with Silktide (yet). Just a proof
              of concept.
            </p>
            <p
              className="text-xs mt-2"
              style={{
                fontFamily: "var(--font-shadows), cursive",
                color: "var(--silver)",
                fontStyle: "italic",
              }}
            >
              Open 9am&ndash;5pm Mon&ndash;Fri. Closed Sundays (Frank&apos;s at
              the track).
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-xs"
              style={{
                fontFamily: "var(--font-ibm-plex), sans-serif",
                color: "var(--silver)",
              }}
            >
              <strong>Data Source:</strong> CourtListener / RECAP
              <br />
              Public Access to Court Electronic Records
            </p>
            <p
              className="text-xs mt-2"
              style={{
                fontFamily: "var(--font-ibm-plex), sans-serif",
                color: "var(--silver)",
              }}
            >
              <strong>Built by</strong> Zach Boyd for Silktide
            </p>
            <p
              className="text-xs mt-2"
              style={{
                fontFamily: "var(--font-ibm-plex), sans-serif",
                color: "var(--silver)",
              }}
            >
              This is a demonstration project built for a job interview, not a
              commercial product.
            </p>
          </div>
        </div>
      </footer>

      {/* Keyboard Help Modal */}
      <KeyboardHelp isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Toast notifications */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
