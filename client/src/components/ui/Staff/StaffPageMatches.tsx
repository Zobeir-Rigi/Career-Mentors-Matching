import { Button } from "@components/ui/Button";

import type { Match } from "@/lib/context/StaffContext";

interface StaffPageMatchesProps {
  matches?: Match[] | null;
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(date: string | null | undefined) {
  if (!date) {
    return "Date unavailable";
  }

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyles(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-ok-tint text-ok";

    case "DECLINED":
      return "bg-tint text-error";

    default:
      return "bg-tint text-accent";
  }
}

export function StaffPageMatches({ matches }: StaffPageMatchesProps) {
  return (
    <section className="mt-12 w-full">
      <h2 className="overshoot font-display text-3xl font-black text-fg sm:text-4xl">
        Matches ({matches?.length ?? 0})
      </h2>

      <p className="mt-2 max-w-2xl font-sans text-sm text-muted">
        Current and previous mentor relationships for this user.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
        {matches && matches.length > 0 ? (
          matches.map((match, index) => (
            <div
              key={`${match.fullName}-${match.createdAt}-${index}`}
              className="border-b border-line p-5 last:border-b-0 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Match details */}
                <div className="min-w-0">
                  <p className="font-sans text-[15px] font-semibold text-fg">
                    {match.fullName}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs text-muted">
                    <span>{formatDate(match.createdAt)}</span>

                    {match.score != null && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          Match score{" "}
                          <span className="font-semibold text-fg">
                            {match.score}
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Match status */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 font-sans text-xs font-semibold ${getStatusStyles(
                      match.status,
                    )}`}
                  >
                    {formatStatus(match.status)}
                  </span>

                  {match.status === "ACTIVE" && (
                    <Button type="button" variant="outline" disabled>
                      End mentorship
                    </Button>
                  )}
                </div>
              </div>

              {/* Match information */}
              <div className="mt-4 rounded-md bg-tint p-4">
                <div className="flex flex-col gap-2 font-sans text-xs text-muted">
                  <p>
                    <span className="font-semibold text-fg">Proposed:</span>{" "}
                    {formatDate(match.createdAt)}
                    {match.proposedBy &&
                      (match.proposedBy === "AUTO_MATCH"
                        ? " · by the system"
                        : ` · by ${match.proposedBy}`)}
                  </p>

                  {match.status === "DECLINED" && (
                    <p>
                      <span className="font-semibold text-error">
                        Declined:
                      </span>{" "}
                      {formatDate(match.declinedAt)}
                      {match.declinedBy && ` · by ${match.declinedBy}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6">
            <p className="font-sans text-sm text-muted">No matches found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
