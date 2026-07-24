import { cn } from "../../lib/utils";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        // 1. Track Base Styles
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",

        // 2. Track Background State (ON vs OFF)
        checked ? "bg-accent" : "bg-line",

        className,
      )}
      {...props}
    >
      {/* 3. Sliding Thumb */}
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-surface shadow-md transform transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
