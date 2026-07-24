import { cn } from "../../lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-line rounded-[10px] p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
