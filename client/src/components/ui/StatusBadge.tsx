interface StatusBadgeProps {
  variant: "proposed" | "accepted" | "active" | "closed";
  children: React.ReactNode;
}

const variantClasses = {
  proposed: "text-accent bg-tint",
  accepted: "text-warn bg-warn-tint",
  active: "text-ok bg-ok-tint",
  closed: "text-muted bg-line/60",
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
