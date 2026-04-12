export default function SilktideCTA({ website }: { website: string }) {
  if (!website || website === "N/A") return null;

  return (
    <a
      href={`https://${website}`}
      target="_blank"
      rel="noopener noreferrer"
      className="cta-primary text-sm"
      style={{ fontFamily: "var(--font-cabin-sketch), cursive" }}
    >
      Visit {website} {"\u2192"}
    </a>
  );
}
