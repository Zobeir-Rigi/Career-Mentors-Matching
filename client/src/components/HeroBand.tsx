import { Button } from "./ui/Button";
import { Thread } from "./ui/Thread";
import { useNavigate } from "react-router-dom";

export function HeroBand() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-12 sm:px-8 md:grid-cols-2 lg:gap-16 lg:px-10 lg:py-16">
      <div className="flex flex-col items-start text-left">
        <p className="font-sans text-xs font-bold uppercase tracking-widest text-accent">
          CODEYOURFUTURE · CAREER MENTORSHIP
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-black leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-6xl">
          Find the mentor who's been where you're going.
        </h1>
        <p className="mt-6 max-w-xl font-sans text-base font-normal leading-7 text-muted sm:text-[17px]">
          CYF pairs trainees with volunteer tech professionals — matched on your
          goals, checked for chemistry, and confirmed by both sides. Sixty-plus
          mentors across eleven disciplines.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
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
            <span className="block font-sans text-xs font-bold uppercase tracking-widest text-accent">
              Mentee
            </span>
            <p className="mt-2 font-display text-xl font-black text-fg">Sam</p>
            <p className="mt-1 font-sans text-sm font-normal leading-5 text-muted">
              Career-switcher, aiming for frontend
            </p>
          </div>
          <Thread />
          <div className="w-[170px] sm:w-[180px] p-4 rounded-[10px] bg-surface border border-line shadow-sm rotate-2">
            <span className="block font-sans text-xs font-bold uppercase tracking-widest text-accent">
              Mentor
            </span>
            <p className="mt-2 font-display text-xl font-black text-fg">Alex</p>
            <p className="mt-1 font-sans text-sm font-normal leading-5 text-muted">
              Senior engineer, ten years in
            </p>
          </div>
        </div>
        <p className="text-xs text-muted text-center font-sans tracking-wide">
          Two dots, one line. That's the whole idea.
        </p>
      </div>
    </div>
  );
}
