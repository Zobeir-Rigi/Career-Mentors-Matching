import { cn } from "../../lib/utils";

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
        "min-h-[44px] px-[16px] py-[10px] rounded-md font-semibold text-sm ransition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",

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
