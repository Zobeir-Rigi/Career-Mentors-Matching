import { Header } from "@/components/Header";
import { ProgrammeTabs } from "@/components/ui/Staff/ProgrammeTabs";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/context/useAuth";

export function Staff() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <Header />

        <main className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-muted">Loading...</p>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <p role="alert" className="text-error">
            Unable to load your profile.
          </p>
        </main>
      </>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <p role="alert" className="text-error">
            You are unauthorized to see this page.
          </p>
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg p-8 space-y-12">
      <Header />
      <div className="container px-5 max-w-[1152px] mx-auto">
        <h1 className="overshoot font-display text-4xl font-black text-fg">
          Programme
        </h1>
        <p className="max-w-2xl text-muted mt-2">
          Everything in one place: capacity is enforced, every change is logged,
          and nothing here can be overwritten by a stray click.
        </p>
      </div>
      <ProgrammeTabs />
      <Footer />
    </div>
  );
}
