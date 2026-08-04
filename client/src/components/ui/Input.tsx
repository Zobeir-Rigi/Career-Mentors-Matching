import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ id, label, error, className, ...props }: InputProps) {
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-fg">
          {label}
        </label>
      )}

      <input
        id={id}
        className={cn(
          "w-full rounded-md border border-border bg-surface px-4 py-3 text-fg outline-none transition",
          "placeholder:text-muted",
          "focus:border-accent focus:ring-2 focus:ring-accent/20",
          error && "border-error focus:border-error focus:ring-error/20",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId  : undefined}
        {...props}
      />

      {error && errorId && (
        <p id={errorId} className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
