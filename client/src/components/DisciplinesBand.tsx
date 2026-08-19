import type { ReactNode } from "react";

import { Chip } from "./ui/Chip";
import { Button } from "./ui/Button";

interface DisciplinesBandProps {
  header?: ReactNode;
  smallerText?: ReactNode;
  isSubmitButtonToRender?: boolean;
  disciplines: string[];
  selectedDisciplines: string[];
  onSelectedDisciplinesChange: (disciplines: string[]) => void;
  onSaveGoals?: () => void | Promise<void>;
  isSavingGoals?: boolean;
}

export const DisciplinesBand = ({
  header,
  smallerText,
  isSubmitButtonToRender,
  disciplines,
  selectedDisciplines,
  onSelectedDisciplinesChange,
  onSaveGoals,
  isSavingGoals = false,
}: DisciplinesBandProps) => {
  function handleChipClick(discipline: string) {
    const updatedDisciplines = selectedDisciplines.includes(discipline)
      ? selectedDisciplines.filter((item) => item !== discipline)
      : [...selectedDisciplines, discipline];

    onSelectedDisciplinesChange(updatedDisciplines);
  }

  return (
    <section
      aria-labelledby="disciplines-heading"
      className="w-full bg-bg py-12 sm:py-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2
          id="disciplines-heading"
          className="overshoot font-display text-[30px] font-black leading-tight text-fg"
        >
          {header}
        </h2>

        {smallerText && (
          <p className="mt-6 max-w-3xl font-sans text-base font-normal leading-6 text-muted">
            {smallerText}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {disciplines.map((discipline) => (
            <Chip
              key={discipline}
              label={discipline}
              isSelected={selectedDisciplines.includes(discipline)}
              onClick={() => handleChipClick(discipline)}
            />
          ))}
        </div>

        {isSubmitButtonToRender && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => void onSaveGoals?.()}
              disabled={isSavingGoals}
            >
              {isSavingGoals ? "Saving goals..." : "Save goals"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
