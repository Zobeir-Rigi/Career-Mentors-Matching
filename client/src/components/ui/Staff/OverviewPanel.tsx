import { GlobalStatisticTiles } from "./GlobalStatisticTiles";
import { MenteesWaiting } from "./MenteesWaiting";

export function OverviewPanel() {
    return (
        <div>
            <GlobalStatisticTiles />
            <MenteesWaiting />
        </div>
    );
}