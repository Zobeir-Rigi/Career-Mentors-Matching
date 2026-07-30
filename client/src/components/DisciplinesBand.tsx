import { useState } from "react";
import { Chip } from "./ui/Chip";

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

export const DisciplinesBand = () => {
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
      className="w-full bg-bg px-5 py-16 sm:px-8 lg:px-10"
    >
      <div className="container max-w-[1152px] mx-auto">
        <h2
          id="disciplines-heading"
          className="overshoot font-display font-semibold text-[30px] text-fg"
        >
          Mentors across eleven disciplines
        </h2>
        <p className="mt-6 max-w-3xl font-sans text-muted">
          From your first CV review to cloud architecture — every mentor sets
          their own capacity, so nobody gets overbooked and nobody gets lost in
          a list.
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
      </div>
    </section>
  );
};
