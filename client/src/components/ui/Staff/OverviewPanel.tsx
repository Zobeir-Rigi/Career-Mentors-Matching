import { GlobalStatisticTiles } from "@/components/ui/Staff/GlobalStatisticTiles";
import { MenteesWaiting } from "@/components/ui/Staff/MenteesWaiting";

export function OverviewPanel() {
    return (
        <div>
            <GlobalStatisticTiles />
            <MenteesWaiting />
        </div>
    );
}