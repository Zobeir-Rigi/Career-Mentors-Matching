interface MentorCapacityCardProps {
  filled: number;
  total: number;
}

export function MentorCapacityCard({ filled, total }: MentorCapacityCardProps) {
  const safeTotal = Math.max(total, 0);
  const safeFilled = Math.min(Math.max(filled, 0), safeTotal);

  const placesOpen = Math.max(safeTotal - safeFilled, 0);
  const isAtCapacity = safeTotal > 0 && safeFilled >= safeTotal;

  const percentage = safeTotal > 0 ? (safeFilled / safeTotal) * 100 : 0;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (percentage / 100) * circumference

  const capacityMessage = isAtCapacity
    ? "You're at capacity."
    : placesOpen === 1
      ? "1 place open."
      : `${placesOpen} places open.`;

  return (
    <section
      aria-label={`Mentor capacity: ${safeFilled} of ${safeTotal} places filled`}
      className="flex items-center gap-5"
    >
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90" aria-hidden="true">
          {/* Empty/background ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-line"
          />

          {/* Filled capacity */}
          {safeFilled > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              className={isAtCapacity ? "text-error" : "text-ok"}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-display text-xl font-semibold ${
              isAtCapacity ? "text-error" : "text-ok"
            }`}
          >
            {safeFilled}/{safeTotal}
          </span>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-fg">Mentee places</p>

        <p
          className={`mt-1 text-sm font-medium ${
            isAtCapacity ? "text-error" : "text-ok"
          }`}
        >
          {capacityMessage}
        </p>
      </div>
    </section>
  );
}
