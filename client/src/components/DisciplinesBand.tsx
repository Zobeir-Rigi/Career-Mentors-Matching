import { Chip } from "./ui/Chip";
import { Button } from "./ui/Button";

interface DisciplinesBandProps {
  header?: React.ReactNode;
  smallerText?: React.ReactNode;
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
  const handleChipClick = (discipline: string) => {
    const updatedDisciplines = selectedDisciplines.includes(discipline)
      ? selectedDisciplines.filter((item) => item !== discipline)
      : [...selectedDisciplines, discipline];

    onSelectedDisciplinesChange(updatedDisciplines);
  };
  return (
    <section
      aria-labelledby="disciplines-heading"
      className="w-full bg-bg py-16"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        <h2
          id="disciplines-heading"
          className="overshoot font-display font-semibold text-[30px] text-fg"
        >
          {header}
        </h2>
        <p className="mt-6 max-w-3xl font-sans text-muted">{smallerText}</p>
        <div className="mt-8 flex flex-wrap gap-3.5">
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
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => void onSaveGoals?.()}
            disabled={isSavingGoals}
          >
            {isSavingGoals ? "Saving..." : "Save goals"}
          </Button>
        )}
      </div>
    </section>
  );
};
