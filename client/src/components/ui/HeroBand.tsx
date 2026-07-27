import { Button } from "./Button";
import { Thread } from "./Thread";

export function HeroBand() {
    return (
        <div className="container max-w-[1152px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
            <div className="flex flex-col items-start text-left">
                <p className="font-sans font-semibold text-[12px] uppercase wide-tracking text-accent">
                    CODEYOURFUTURE · CAREER MENTORSHIP
                </p>
                <h1 className="font-display font-semibold text-[36px] md:text-[56px] lg:text-[60px] leading-[1.05] tracking-[-0.02em] max-w-[560px] mb-6">
                    Find the mentor who's been where you're going.
                </h1>
                <p className="font-sans text-[17px] text-muted max-w-[560px] mb-8">
                    CYF pairs trainees with volunteer tech professionals — matched on
                    your goals, checked for chemistry, and confirmed by both sides.
                    Sixty-plus mentors across eleven disciplines.
                </p>
                <div className="flex gap-4 items-center">
                    <Button className="bg-accent text-on-accent">Find your mentor</Button>
                    <Button variant="outline">Volunteer as a mentor</Button>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[500px] h-[200px] flex items-center justify-between">
                    <div className="w-[170px] sm:w-[180px] p-4 rounded-[10px] bg-surface border border-line shadow-sm -rotate-2">
                        <span className="block text-[10px] font-semibold tracking-wider text-muted uppercase">
                            Mentee
                        </span>
                        <h3 className="font-display text-lg font-semibold text-fg">Sam</h3>
                        <p className="text-xs text-muted">
                            Career-switcher, aiming for frontend
                        </p>
                    </div>
                    <Thread />
                    <div className="w-[170px] sm:w-[180px] p-4 rounded-[10px] bg-surface border border-line shadow-sm rotate-2">
                        <span className="block text-[10px] font-semibold tracking-wider text-muted uppercase">
                            Mentor
                        </span>
                        <h3 className="font-display text-lg font-semibold text-fg">Alex</h3>
                        <p className="text-xs text-muted">
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