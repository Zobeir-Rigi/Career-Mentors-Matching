import { Link } from "react-router-dom";

interface LogoProps {
  showProductName?: boolean;
}

export function Logo({ showProductName = true }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="CodeYourFuture Mentoring home"
      className="flex shrink-0 items-center"
    >
      <span
        aria-hidden="true"
        className="inline-flex flex-col items-end font-logo font-black leading-[0.82]"
      >
        <span className="whitespace-nowrap">
          <span className="text-muted">&lt;</span>
          <span className="text-accent-hover">CODE</span>
          <span className="text-muted">&gt;</span>
          <span className="text-muted">YOUR</span>
        </span>

        <span className="text-muted">FUTURE</span>
      </span>

      {showProductName && (
        <span className="ml-4 whitespace-nowrap font-sans text-sm font-bold text-accent sm:ml-5 sm:text-base md:ml-6 md:text-lg">
          Mentoring
        </span>
      )}
    </Link>
  );
}
