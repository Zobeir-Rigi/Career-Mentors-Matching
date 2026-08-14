import { Thread } from "../ui/Thread";

interface MentorEmptyStateProps {
  isAcceptingMentees: boolean;
}

export function MentorEmptyState({
  isAcceptingMentees,
}: MentorEmptyStateProps) {
  return (
    <section className="w-full rounded-lg border-y border-line bg-surface px-6 py-12 text-center">
      <div className="mx-auto max-w-6xl">
        <Thread className="mx-auto h-12 w-48 mb-2" />
        <h2 className="font-display text-2xl font-semibold text-fg">
          No mentees yet — your line is ready.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
          {isAcceptingMentees
            ? "You'll be notified when the matcher proposes someone whose goals fit your disciplines."
            : "You're paused. Flip the switch above when you're ready for mentees."}
        </p>
      </div>
    </section>
  );
}
