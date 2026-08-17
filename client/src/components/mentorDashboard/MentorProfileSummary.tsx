interface MentorProfileSummaryProps {
  disciplines: string[];
  bio: string | null;
}

export function MentorProfileSummary({
  disciplines,
  bio,
}: MentorProfileSummaryProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="overshoot font-display text-[30px] font-semibold text-fg">
          Your mentoring profile
        </h2>
        <p className="mt-2 text-muted">
          What the matcher currently knows about you.
        </p>
      </div>

      <div className="grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-fg">Disciplines</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {disciplines.length > 0 ? disciplines.join(", ") : "—"}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-fg">Bio shown to matches</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {bio?.trim() || "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
