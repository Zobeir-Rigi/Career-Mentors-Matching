import { Button } from "./ui/Button";
import { Thread } from "./ui/Thread";
import { useNavigate } from "react-router-dom";

export function HeroBand() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-5 sm:px-8 md:grid-cols-[1.1fr_1fr] lg:px-10">
      <div className="flex flex-col items-start text-left">
        <p className="font-sans font-semibold text-[12px] uppercase wide-tracking text-accent">
          CODEYOURFUTURE · CAREER MENTORSHIP
        </p>
        <h1 className="mb-6 max-w-[560px] font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[56px] lg:text-[60px]">
          Find the mentor who's been where you're going.
        </h1>
        <p className="font-sans text-[17px] text-muted max-w-[560px] mb-8">
          CYF pairs trainees with volunteer tech professionals — matched on your
          goals, checked for chemistry, and confirmed by both sides. Sixty-plus
          mentors across eleven disciplines.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <Button
            className="w-full bg-accent text-on-accent sm:w-auto"
            onClick={() => navigate("/signup")}
          >
            Find your mentor
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate("/signup")}
          >
            Volunteer as a mentor
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[500px] h-[200px] flex items-center justify-between">
          <div className="w-[170px] sm:w-[180px] p-4 rounded-[10px] bg-surface border border-line shadow-sm -rotate-2">
            <span className="block text-[10px] font-semibold tracking-wider text-muted uppercase">
              Mentee
            </span>
            <p className="font-display text-lg font-semibold text-fg">Sam</p>
            <p className="text-xs text-muted">
              Career-switcher, aiming for frontend
            </p>
          </div>
          <Thread />
          <div className="w-[170px] sm:w-[180px] p-4 rounded-[10px] bg-surface border border-line shadow-sm rotate-2">
            <span className="block text-[10px] font-semibold tracking-wider text-muted uppercase">
              Mentor
            </span>
            <p className="font-display text-lg font-semibold text-fg">Alex</p>
            <p className="text-xs text-muted">Senior engineer, ten years in</p>
          </div>
        </div>
        <p className="text-xs text-muted text-center font-sans tracking-wide">
          Two dots, one line. That's the whole idea.
        </p>
      </div>
    </div>
  );
}
