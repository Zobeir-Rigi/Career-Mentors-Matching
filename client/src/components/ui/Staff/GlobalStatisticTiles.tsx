import { Card } from "@components/ui/Card";
import { useStaff } from "@/lib/context/StaffContext";

export function GlobalStatisticTiles() {
  const { globalMatchingData, isLoading } = useStaff();

  if (isLoading || !globalMatchingData) {
    return <div>Loading matching data...</div>;
  }
  const statistics = [
    {
      label: "Volunteer mentors",
      value: globalMatchingData.volunteerMentors,
    },
    {
      label: "Mentors awaiting approval",
      value: globalMatchingData.pendingMentors,
    },
    {
      label: "Open mentee places",
      value: globalMatchingData.openMenteePlaces,
    },
    {
      label: "Live matches",
      value: globalMatchingData.liveMatches,
    },
    {
      label: "Mentees waiting",
      value: globalMatchingData.menteesWaiting,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,180px))]">
      {" "}
      {statistics.map((statistic) => (
        <Card key={statistic.label} className="w-full p-4">
          <p className="font-display text-4xl font-black text-center  text-fg">
            {statistic.value}
          </p>

          <p className="mt-2 font-sans text-xs font-normal text-center text-muted">
            {statistic.label}
          </p>
        </Card>
      ))}
    </div>
  );
}
