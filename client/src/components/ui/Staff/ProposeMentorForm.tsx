import { Button } from "@components/ui/Button";

export function ProposeMentorForm() {
    function handleProposePair() {
        console.log("propose mentorship manually");
    }
    return (
        <div className="bg-surface border border-line rounded-[10px] mt-12 p-6">
            <p className="font-sans text-[16px] text-fg">Propose a specific mentor</p>
            <p className="font-sans text-[15px] text-muted">
                Your judgment outranks the algorithm — capacity and past rejections are still enforced, and the pairing is recorded as a staff action.
            </p>
            <div className="mt-4 flex flex-row">
                <input
                    className="h-[46px] w-[384px] border-1 border-line bg-surface rounded-[6px]"
                    placeholder="Choose a mentor with an open place…">
                </input>
                <Button onClick={() => handleProposePair()} className="ml-2">Propose pair</Button>
            </div>
        </div>
    );
}