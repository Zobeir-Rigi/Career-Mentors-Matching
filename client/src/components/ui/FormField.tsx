interface FormFieldProps {
  label: string;
  optional?: string;
  children: React.ReactNode;
}

export function FormField({ label, optional, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>
      <span className="mx-2 text-sm text-muted">{optional}</span>

      {children}
    </div>
  );
}
