import { Card } from "@components/ui/Card";
import { useStaff } from "@/lib/context/StaffContext";

export function GlobalStatisticTiles() {
    const { globalMatchingData, isLoading } = useStaff();
    if (isLoading) {
        return <div>Loading matching data...</div>;
    }
    return (
        <div className="flex flex-row items-center justify-between gap-3">
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData ? globalMatchingData.applicantsNumber : 0}</h1>
                <p className="text-[11px] text-muted">Applicants to mentors</p>
            </Card>
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData ? globalMatchingData.volunteerMentors : 0}</h1>
                <p className="text-[11px] text-muted">Volunteer mentors</p>
            </Card>
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData ? globalMatchingData.openMenteePlaces : 0}</h1>
                <p className="text-[11px] text-muted">Open mentee places</p>
            </Card>
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData ? globalMatchingData.liveMatches : 0}</h1>
                <p className="text-[11px] text-muted">Live matches</p>
            </Card>
            <Card className="max-w-[166px] max-h-[108px] space-y-6">
                <h1 className="font-display text-4xl font-semibold mb-1">{globalMatchingData ? globalMatchingData.menteesWaiting : 0}</h1>
                <p className="text-[11px] text-muted">Mentees waiting</p>
            </Card>
        </div>
    );
}