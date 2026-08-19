interface ChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function Chip({ label, isSelected, onClick }: ChipProps) {
  const baseStyles =
    "rounded-full px-4 py-[9px] text-[14px] font-bold transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  const stateStyles = isSelected
    ? "bg-accent text-on-accent hover:bg-accent-hover"
    : "bg-surface border-[1.5px] border-line bg-surface text-fg hover:border-accent hover:bg-tint";

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
