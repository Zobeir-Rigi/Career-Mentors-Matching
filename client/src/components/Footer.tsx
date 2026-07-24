import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
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
