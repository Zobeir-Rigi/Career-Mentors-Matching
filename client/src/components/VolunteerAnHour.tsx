import { Button } from "./ui/Button";
import { Thread } from "./ui/Thread";

export function VolunteerAnHour() {
  return (
    <section className="w-full bg-surface px-5 py-16 md:py-24">
      <div className="max-w-[1152px] mx-auto  grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col items-start">
          <h2 className="overshoot font-display font-semibold text-[30px] text-fg mb-6">
            Volunteer an hour, change a career
          </h2>
          <p className="font-sans text-[17px] leading-[1.65] text-muted max-w-[560px] mb-8">
            Set your capacity — one mentee or five. We only propose people whose
            goals match what you actually offer, and if either side doesn't
            respond within a week, the match frees itself. Your calendar link
            does the scheduling.
          </p>
          <Button className="bg-accent text-on-accent">Become a mentor</Button>
        </div>
        <div className="flex flex-col items-start max-w-[510px]">
          <div className="w-full h-8 mb-4 relative flex items-center">
            <Thread />
          </div>
          <blockquote className="font-display font-semibold text-[28px] leading-[1.35] text-fg mb-4">
            "A good match shouldn't depend on luck. It should put the right two
            people on either end of a line."
          </blockquote>
          <cite className="font-sans text-[14px] text-muted not-italic">
            — the CYF mentorship team
          </cite>
        </div>
      </div>
    </section>
  );
}
