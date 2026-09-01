import { GlobalStatisticTiles } from "@/components/ui/Admin/GlobalStatisticTiles";
import { MenteesWaiting } from "@/components/ui/Admin/MenteesWaiting";

export function OverviewPanel() {
    return (
        <div>
            <GlobalStatisticTiles />
            <MenteesWaiting />
        </div>
    );
}