import type { MenteeDashboardPastMatch } from "@/services/menteeDashboardService";

interface PastMatchesProps {
  matches: MenteeDashboardPastMatch[];
}

export function PastMatches({ matches }: PastMatchesProps) {
  function formatDate(date: string | null) {
    if (!date) {
      return null;
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <section
      aria-labelledby="past-matches-heading"
      className="mx-auto w-full max-w-6xl"
    >
      <h2
        id="past-matches-heading"
        className="overshoot font-display text-[30px] font-black leading-tight text-fg"
      >
        Past matches
      </h2>

      <p className="mt-6 font-sans text-base font-normal text-muted">
        Your previous mentorship matches.
      </p>

      <div className="mt-8 space-y-4">
        {matches.map((match) => {
          const isCompleted = match.status === "COMPLETED";

          const date = formatDate(
            isCompleted ? match.completedAt : match.declinedAt,
          );

          return (
            <article
              key={match.id}
              className="rounded-[10px] border border-line bg-surface p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-black text-fg">
                    {match.mentorName}
                  </h3>

                  {match.focusAreas.length > 0 && (
                    <p className="mt-2 font-sans text-sm font-normal text-muted">
                      {match.focusAreas.join(" · ")}
                    </p>
                  )}
                </div>

                <span
                  className={
                    isCompleted
                      ? "w-fit rounded-full bg-ok-tint px-3 py-1 font-sans text-xs font-bold text-ok"
                      : "w-fit rounded-full bg-tint px-3 py-1 font-sans text-xs font-bold text-accent"
                  }
                >
                  {isCompleted ? "Completed" : "Declined"}
                </span>
              </div>

              {date && (
                <p className="mt-5 border-t border-line pt-4 font-sans text-sm font-normal text-muted">
                  {isCompleted
                    ? `Mentorship ended ${date}`
                    : `Match declined ${date}`}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
