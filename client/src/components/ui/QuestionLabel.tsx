import { cn } from "../../lib/utils";

interface QuestionLabelProps {
  question: string;
}

export function QuestionLabel({ question }: QuestionLabelProps) {
  return (
    <label className={cn("block mb-4 text-sm font-semibold")}>{question}</label>
  );
}
