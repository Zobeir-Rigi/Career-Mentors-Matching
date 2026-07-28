import { cn } from "../../lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-line bg-surface px-4 py-2",
        className,
      )}
      {...props}
    />
  );
}

