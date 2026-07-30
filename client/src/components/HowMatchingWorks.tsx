export function HowMatchingWorks() {
    return (
        <section className="w-full bg-surface py-16 md:py-24 border-b border-line">
            <div className="container max-w-[1152px] mx-auto">
                <h2 className="overshoot font-display font-semibold text-[30px] text-fg mb-12">
                    How matching works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="flex flex-col items-start">
                        <span className="font-display text-[46px] leading-none text-accent-soft font-normal mb-3">
                            1
                        </span>
                        <h3 className="font-display text-[20px] font-semibold text-fg mb-2">
                            Tell us where you're heading
                        </h3>
                        <p className="font-sans text-[14px] leading-relaxed text-muted">
                            Pick the disciplines you want to grow in, your availability, and what you want from mentorship.
                        </p>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-display text-[46px] leading-none text-accent-soft font-normal mb-3">
                            2
                        </span>
                        <h3 className="font-display text-[20px] font-semibold text-fg mb-2">
                            We propose your best match
                        </h3>
                        <p className="font-sans text-[14px] leading-relaxed text-muted">
                            Scored on shared disciplines, availability, and location — never a name picked off a long list.
                        </p>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-display text-[46px] leading-none text-accent-soft font-normal mb-3">
                            3
                        </span>
                        <h3 className="font-display text-[20px] font-semibold text-fg mb-2">
                            Meet for a chemistry session
                        </h3>
                        <p className="font-sans text-[14px] leading-relaxed text-muted">
                            A short, no-commitment call booked straight into your mentor's calendar.
                        </p>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-display text-[46px] leading-none text-accent-soft font-normal mb-3">
                            4
                        </span>
                        <h3 className="font-display text-[20px] font-semibold text-fg mb-2">
                            Both confirm — mentoring begins
                        </h3>
                        <p className="font-sans text-[14px] leading-relaxed text-muted">
                            You each get seven days to say yes. No reply? The match frees up automatically, no chasing.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}