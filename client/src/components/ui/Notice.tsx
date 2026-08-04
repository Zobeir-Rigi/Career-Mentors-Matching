import { cn } from "../../lib/utils";

interface missingFieldsProps {
  missingFields: string[];
}

export function Notice({ missingFields }: missingFieldsProps) {
  return (
    missingFields.length > 0 && (
      <section className="max-w-[708px]">
        <div
          className={cn("rounded-md bg-warn-tint px-4 py-3 text-sm text-fg")}
        >
          <span className="font-semibold">You can't be matched yet.</span>

          <span className="ml-4">
            Still needed: your {missingFields.join(", ")} — set it below and
            save.
          </span>
        </div>
      </section>
    )
  );
}
