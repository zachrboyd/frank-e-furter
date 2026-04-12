"use client";

const rotations = [-12, -6, 0, 5, 10, -8, 3, -4, 7, -10, 2, -5, 8, -3, 6, -7];

export default function ConfidenceBadge({
  score,
  index,
}: {
  score: number;
  index: number;
}) {
  const rotation = rotations[index % rotations.length];

  return (
    <div
      className="stamp"
      style={{
        fontFamily: "var(--font-permanent-marker), cursive",
        fontSize: "14px",
        transform: `rotate(${rotation}deg)`,
        position: "absolute",
        top: "12px",
        left: "12px",
      }}
      aria-label={`Confidence score: ${score}%`}
    >
      <span aria-hidden="true">{score}%</span>
      <span
        style={{ fontSize: "8px", letterSpacing: "1px", marginTop: "2px" }}
        aria-hidden="true"
      >
        CONFIDENCE
      </span>
    </div>
  );
}
