import { useStaff } from "@/lib/context/StaffContext";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";

export function MenteesWaiting() {
    const { menteesWaitingData, isLoading } = useStaff();
    if (isLoading || !menteesWaitingData) {
        return <div>Loading mentees in waiting list...</div>;
    }
    async function handleProposeMatch() {
        //scaffold for backend integration
        console.log("Api request for a match.")
    }
    return (
        <div className="mt-8">
            <div>
                <h1 className="font-display text-4xl font-semibold overshoot">
                    Waiting for a mentor
                </h1>
                <p className="max-w-2xl text-muted mt-2">
                    Each button runs the matcher for that mentee — same scoring, same capacity checks.
                </p>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {
                    menteesWaitingData.map((mentee, index) => {
                        return (
                            <Card key={index} className="max-w-[563px] flex flex-row items-center justify-between">
                                <div>
                                    <p className="font-sans text-[16px] font-semibold text-fg">{mentee.fullName}</p>
                                    <p className="font-sans text-[12px] text-muted">{mentee.goals[0]}</p>
                                </div>
                                <Button onClick={() => handleProposeMatch()} className="ml-2" variant="outline">Propose match</Button>
                            </Card>
                        );
                    })
                }
            </div>
        </div>
    );
}