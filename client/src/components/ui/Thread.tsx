interface ThreadProps {
  className?: string;
}

export function Thread({ className = "w-48 h-12" }: ThreadProps) {
  return (
    <svg viewBox="0 0 200 50" className={className} fill="none">
      <circle
        cx="10"
        cy="25"
        r="4"
        className="thread-dot fill-accent thread-dot-a"
      />
      <path
        d="M 10 25 C 70 5, 130 45, 190 25"
        stroke="currentColor"
        strokeWidth="2.5"
        className="thread-draw text-accent"
      />
      <circle
        cx="190"
        cy="25"
        r="4"
        className="thread-dot fill-accent thread-dot-b"
      />
    </svg>
  );
}
