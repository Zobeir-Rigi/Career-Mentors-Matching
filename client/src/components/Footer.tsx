import { Logo } from "./ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 sm:px-8 md:flex-row lg:px-10">
        <Logo />
        <p className="text-sm text-muted">
          © 2026 CYF Mentoring. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-muted">
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <a href="/terms" className="hover:underline">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
