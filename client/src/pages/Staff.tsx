import { Header } from "@/components/Header";
import { ProgrammeTabs } from "@/components/ui/Staff/ProgrammeTabs";
import { Footer } from "@/components/Footer";

export function Staff() {
    return (
        <div className="min-h-screen bg-bg text-fg p-8 space-y-12">
            <Header />
            <div className="container px-5 max-w-[1152px] mx-auto">
                <h1 className="font-display text-4xl font-semibold overshoot">
                    Programme
                </h1>
                <p className="max-w-2xl text-muted mt-2">
                    Everything in one place: capacity is enforced, every change is logged, and nothing here can be overwritten by a stray click.
                </p>
            </div>
            <ProgrammeTabs />
            <Footer />
        </div>

    );
}