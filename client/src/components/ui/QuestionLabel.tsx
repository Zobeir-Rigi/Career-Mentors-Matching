import { cn } from "../../lib/utils";

interface QuestionLabelProps {
  question: string;
  className?: string;
}

export function QuestionLabel({ question, className }: QuestionLabelProps) {
  return (
    <label className={cn(`block mb-4 text-sm font-semibold ${className}`)}>
      {question}
    </label>
  );
}
