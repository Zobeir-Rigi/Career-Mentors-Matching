type Option =
  | string
  | {
      label: string;
      value: string;
    };

interface RadioGroupProps {
  name: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
}: RadioGroupProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {options.map((option) => {
        const optValue = typeof option === "string" ? option : option.value;
        const optLabel = typeof option === "string" ? option : option.label;

        return (
          <label
            key={optValue}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={optValue}
              checked={value === optValue}
              onChange={() => onChange(optValue)}
            />
            {optLabel}
          </label>
        );
      })}
    </div>
  );
}