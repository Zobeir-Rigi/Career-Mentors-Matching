interface titleProps {
  titleName: string;
  titleDescription: string;
}

export function PageTitle({ titleName, titleDescription }: titleProps) {
  return (
    <section className="space-y-4">
      <h1 className="font-display text-4xl font-semibold overshoot">
        {titleName}
      </h1>

      <p className="max-w-2xl text-muted">{titleDescription}</p>
    </section>
  );
}
