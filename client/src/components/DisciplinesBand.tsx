import { useState } from "react";
import { Chip } from "./ui/Chip";
import { Button } from "./ui/Button";

const disciplines: string[] = [
  "Software Engineering",
  "Data & Analytics",
  "Data Engineering",
  "DevOps, Cloud & Platform",
  "Cybersecurity",
  "QA & Testing",
  "Product & Project Management",
  "Business Analysis",
  "UX & Design",
  "Career Development & Interview Prep",
  "Leadership & Management",
];

export const DisciplinesBand = ({ header, smallerText, isSubmitButtonToRender }: any) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string[]>([]);

  // handle chip click
  const handleChipClick = (discipline: string) => {
    setSelectedDiscipline((current) =>
      current.includes(discipline)
        ? current.filter((item) => item !== discipline)
        : [...current, discipline],
    );
  };
  return (
    <section
      aria-labelledby="disciplines-heading"
      className="bg-bg px-5 py-16 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-277.5">
        <h2
          id="disciplines-heading"
          className="overshoot font-display font-semibold text-[30px] text-fg"
        >
          {header}
        </h2>
        <p className="mt-6 max-w-3xl font-sans text-muted">
          {smallerText}
        </p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          {disciplines.map((discipline) => (
            <Chip
              key={discipline}
              label={discipline}
              isSelected={selectedDiscipline.includes(discipline)}
              onClick={() => handleChipClick(discipline)}
            />
          ))}
        </div>
        {isSubmitButtonToRender && (
          <Button variant="outline" className="mt-3">Save goals</Button>
        )}
      </div>
    </section>
  );
};
