export default function SectionHeader({
  title,
  color,
  emoji,
  id,
}: {
  title: string;
  color: string;
  emoji?: string;
  id: string;
}) {
  return (
    <div className="mb-6" id={id}>
      <h2
        className="text-2xl md:text-3xl uppercase tracking-wide text-left"
        style={{
          fontFamily: "var(--font-special-elite), cursive",
          color,
          letterSpacing: "2px",
        }}
      >
        {emoji && <span aria-hidden="true">{emoji} </span>}
        {title}
      </h2>
      <svg
        width="200"
        height="4"
        className="mt-2"
        role="presentation"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="2"
          x2="200"
          y2="2"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="8,4"
        />
      </svg>
    </div>
  );
}
