import { cn } from "@lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "quiet";
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "min-h-11 px-4 py-2.5 rounded-md font-bold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",

        // Variant styles
        variant === "primary" &&
          "bg-accent text-on-accent hover:bg-accent-hover",
        variant === "outline" &&
          "border-[1.5px] border-accent text-accent hover:bg-tint",
        variant === "quiet" && "text-muted hover:bg-tint",

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
