import { Card } from "../Card";
import { useStaff } from "./StaffContext";

export function GlobalStatisticTiles() {
    const { globalMatchingData, isLoading } = useStaff();
    if (isLoading || !globalMatchingData) {
        return <div>Loading matching data...</div>;
    }
    return (
        <div className="flex flex-row items-center justify-between gap-3">
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData.applicantsNumber}</h1>
                <p className="text-[11px] text-muted">Applicants to mentors</p>
            </Card>
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData.volunteerMentors}</h1>
                <p className="text-[11px] text-muted">Volunteer mentors</p>
            </Card>
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData.openMenteePlaces}</h1>
                <p className="text-[11px] text-muted">Open mentee places</p>
            </Card>
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData.liveMatches}</h1>
                <p className="text-[11px] text-muted">Live matches</p>
            </Card>
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData.menteesWaiting}</h1>
                <p className="text-[11px] text-muted">Mentees waiting</p>
            </Card>
        </div>
    );
}