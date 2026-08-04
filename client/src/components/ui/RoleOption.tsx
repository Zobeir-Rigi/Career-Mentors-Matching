import { cn } from "@/lib/utils";
import { type SignupRole } from "../../services/authService";

interface RoleOptionProps {
  role: SignupRole;
  title: string;
  description: string;
  selectedRole: SignupRole | "";
  onSelect: (role: SignupRole) => void;
}

export function RoleOption({
  role,
  title,
  description,
  selectedRole,
  onSelect,
}: RoleOptionProps) {
  const isSelected = selectedRole === role;

  return (
    <label
      className={cn(
        "relative flex min-h-16 cursor-pointer flex-col justify-center rounded-md border px-3 py-2 transition",
        isSelected
          ? "border-accent bg-tint ring-1 ring-accent"
          : "border-line bg-surface hover:border-accent",
      )}
    >
      <input
        type="radio"
        name="role"
        value={role}
        checked={isSelected}
        onChange={() => onSelect(role)}
        className="sr-only"
      />

      <span className="text-sm font-semibold text-fg">{title}</span>

      <span className="mt-0.5 text-xs text-muted">{description}</span>
    </label>
  );
}
