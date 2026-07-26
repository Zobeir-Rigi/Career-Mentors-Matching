interface ChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function Chip({ label, isSelected, onClick }: ChipProps) {
  const baseStyles =
    "rounded-full py-[9px] px-[16px] font-semibold text-[14px] min-h-[44px]";

  const stateStyles = isSelected
    ? "bg-accent text-on-accent"
    : "bg-surface border-[1.5px] border-line hover:border-accent-hover";

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`${baseStyles} ${stateStyles}`}
    >
      {label}
    </button>
  );
}
