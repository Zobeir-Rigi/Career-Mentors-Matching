interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">
        {label}
      </label>

      {children}
    </div>
  );
}