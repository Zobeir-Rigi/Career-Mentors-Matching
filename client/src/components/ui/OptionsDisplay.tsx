import { optionsSetHandler } from "../../lib/utils";
import { Chip } from "./Chip";

interface OptionsDisplayProps {
  options: string[];
  selectedOptionsSet: Set<string>;
  onToggle: (option: string) => void;
}

export function OptionsDisplay({
  options,
  selectedOptionsSet,
}: OptionsDisplayProps) {
  return (
    <div className="max-w-[738px]">
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            isSelected={selectedOptionsSet.has(option)}
            onClick={() => optionsSetHandler()}
          />
        ))}
      </div>
    </div>
  );
}
