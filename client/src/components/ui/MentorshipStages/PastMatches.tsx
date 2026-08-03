import { Button } from "../Button";

export function PastMatches() {
    return (
        <div className="container max-w-[1152px] mx-auto">

            <h2 className="overshoot font-display font-semibold text-[36px] mb-6">Past matches</h2>
            <div className="flex">
                <input className="bg-surface w-[1152px] h-12 rounded-[10px]"></input>
                <Button
                    variant="quiet"
                >Rejected</Button>
            </div>

        </div >
    );
}