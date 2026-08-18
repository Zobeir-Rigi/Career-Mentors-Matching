import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ThemeToggle";
import { Thread } from "../ui/Thread";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Desktop branding */}
        <section className="hidden lg:flex lg:flex-col lg:bg-tint lg:px-14 lg:py-10">
          <Logo />

          <div className="my-auto max-w-lg py-12 lg:py-0">
            <Thread />
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">
              Every mentorship here is two dots and one line — you're one of the
              dots.
            </h1>
            <p className="mt-4 max-w-md text-muted">
              Matched on goals, checked for chemistry, confirmed by both sides
              within a week.
            </p>
          </div>
        </section>

        {/* Auth form */}
        <section className="relative flex min-h-screen items-center bg-surface px-6 py-12 sm:px-10 lg:px-16">
          <div className="absolute right-6 top-6 sm:right-10 sm:top-8">
            <ThemeToggle />
          </div>

          {/* Slot for the specific auth page (login, signup, etc.) */}
          <div className="mx-auto w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-10 pr-14 lg:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
