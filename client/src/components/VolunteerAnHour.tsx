import { Button } from "./ui/Button";
import { Thread } from "./ui/Thread";
import { useNavigate } from "react-router-dom";

export function VolunteerAnHour() {
  const navigate = useNavigate();
  return (
    <section className="w-full bg-surface py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 sm:px-8 md:grid-cols-2 lg:gap-16 lg:px-10">
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
          <Button
            className="w-full bg-accent text-on-accent sm:w-auto"
            onClick={() => navigate("/signup")}
          >
            Become a mentor
          </Button>
        </div>
        <div className="flex flex-col items-start max-w-[510px]">
          <div className="w-full h-8 mb-4 relative flex items-center">
            <Thread />
          </div>
          <blockquote className="mb-4 font-display text-[24px] font-semibold leading-[1.35] text-fg sm:text-[28px]">
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
