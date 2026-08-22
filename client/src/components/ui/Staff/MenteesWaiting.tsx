import { useStaff } from "@/lib/context/StaffContext";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";

export function MenteesWaiting() {
  const { menteesWaitingData, isLoading } = useStaff();

  if (isLoading) {
    return <div>Loading mentees in waiting list...</div>;
  }

  return (
    <section className="mt-8">
      <div>
        <h2 className="overshoot font-display text-4xl font-semibold text-fg">
          Waiting for a mentor
        </h2>

        <p className="mt-2 max-w-2xl font-sans text-sm text-muted">
          These mentees do not currently have a suitable mentor available.
        </p>
      </div>

      {menteesWaitingData.length === 0 ? (
        <Card className="mt-4">
          <p className="font-sans text-sm text-muted">
            No mentees are currently waiting for a mentor.
          </p>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {menteesWaitingData.map((mentee) => (
            <Card
              key={mentee.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-sans text-base font-bold text-fg">
                  {mentee.fullName}
                </p>

                <p className="mt-1 font-sans text-xs text-muted">
                  {mentee.goals.length > 0
                    ? mentee.goals.join(", ")
                    : "No goals recorded"}
                </p>

                <p className="mt-2 font-sans text-xs text-muted">
                  Waiting since{" "}
                  {new Date(mentee.waitingSince).toLocaleDateString("en-GB")}
                </p>

                <a
                  href={`mailto:${mentee.email}`}
                  className="mt-2 inline-block font-sans text-sm font-bold text-accent underline underline-offset-4"
                >
                  Email
                </a>
              </div>

              <Button type="button" variant="outline" disabled>
                Propose match
              </Button>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
