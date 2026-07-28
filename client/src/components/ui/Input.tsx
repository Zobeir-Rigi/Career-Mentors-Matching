import { cn } from "../../lib/utils";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-line bg-surface px-4 py-2",
        className,
      )}
      {...props}
    />
  );
}