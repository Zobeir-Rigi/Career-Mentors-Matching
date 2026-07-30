interface sectionProps {
  sectionHead: string;
  sectionDescription: string;
}

export function SectionHead({ sectionHead, sectionDescription }: sectionProps) {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold">
        <span className="overshoot">{sectionHead}</span>
      </h2>

      <p className="text-muted">{sectionDescription}</p>
    </>
  );
}
