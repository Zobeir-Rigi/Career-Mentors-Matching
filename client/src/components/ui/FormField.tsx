interface FormFieldProps {
  label: string;
  htmlFor: string;
  optional?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  optional,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold" htmlFor={htmlFor}>
        {label}
      </label>
      {optional && <span className="mx-2 text-sm text-muted">{optional}</span>}
      {children}
    </div>
  );
}
