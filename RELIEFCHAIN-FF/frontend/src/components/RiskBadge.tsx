type RiskBadgeProps = {
  score: number;
};

export default function RiskBadge({
  score,
}: RiskBadgeProps) {
  const normalized = Math.max(0, Math.min(100, score));

  if (normalized <= 30) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
        LOW · {normalized}
      </span>
    );
  }

  if (normalized <= 70) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
        MEDIUM · {normalized}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
      HIGH · {normalized}
    </span>
  );
}