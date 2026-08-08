import { Chip } from "./Chip";

type Option =
  | string
  | {
      label: string;
      value: string;
    };
interface OptionsDisplayProps {
  options: Option[];
  selectedOptionsSet: Set<string>;
  onToggle: (value: string) => void;
}

export function OptionsDisplay({
  options,
  selectedOptionsSet,
  onToggle,
}: OptionsDisplayProps) {
  return (
    <div className="max-w-[738px]">
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const optValue = typeof option === "string" ? option : option.value;
          const optLabel = typeof option === "string" ? option : option.label;

          return (
            <Chip
              key={optValue}
              label={optLabel}
              isSelected={selectedOptionsSet.has(optValue)}
              onClick={() => onToggle(optValue)}
            />
          );
        })}
      </div>
    </div>
  );
}
