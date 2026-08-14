import { Button } from "../Button";

export interface Match {
    fullName: string;
    proposed: string;
    score?: number | string;
    status: string;
    proposedBy?: string;
}

interface StaffPageMatchesProps {
    matches?: Match[] | null;
}

export function StaffPageMatches({ matches }: StaffPageMatchesProps) {
    return (
        <div className="mt-12">
            <h2 className="font-display text-4xl font-semibold overshoot">
                {`Matches(${matches?.length ?? 0})`}
            </h2>
            <p className="max-w-2xl text-muted mt-2">
                Every status change is recorded — who did it, and when.
            </p>
            <div className="bg-surface border border-line rounded-[10px] mt-4 p-6">
                {matches && matches.length > 0 ? (
                    matches.map((match, index) => (
                        <div key={index}>
                            <div className="flex flex-row items-center justify-between w-full">
                                <div>
                                    <p className="font-sans text-[15px] text-fg">{match.fullName}</p>
                                    <p className="font-sans text-[12px] text-muted">
                                        {match.proposed}{match.score ? ` score · ${match.score}` : ``}
                                    </p>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    {match.status === "Active" ? (
                                        <>
                                            <div className="flex h-[22px] items-center justify-center rounded-[11px] bg-ok-tint px-3">
                                                <p className="font-sans text-[12px] leading-none text-ok">Active</p>
                                            </div>
                                            <Button variant="outline">End mentorship</Button>
                                        </>
                                    ) : (
                                        <div className="flex h-[22px] items-center justify-center rounded-[11px] bg-tint px-3">
                                            <p className="font-sans text-[12px] leading-none text-muted">
                                                {match.status}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="-mt-px h-px w-full bg-line mt-4" />
                            <div>
                                <p className="font-sans text-[12px] text-muted">{match.proposed} --
                                    <span className="text-[12px] text-fg font-semibold">{match.status === "ACTIVE" ? "ACTIVE" : "PROPOSED"}</span> -
                                    {match.proposedBy === "AUTO_MATCH"
                                        ? ` by the system · ${match.proposedBy}`
                                        : ` by · ${match.proposedBy}`}
                                </p>
                                {match.status === "REJECTED" && (
                                    <>
                                        <p className="font-sans text-[12px] text-muted">{match.proposed} --
                                            <span className="text-[12px] text-MUTED font-semibold">PROPOSED</span> --
                                            <span className="text-[12px] text-fg font-semibold">{match.status}</span> -
                                            {match.proposedBy === "AUTO_MATCH"
                                                ? ` by the system · ${match.proposedBy}`
                                                : ` by · ${match.proposedBy}`}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="font-sans text-[15px] text-muted">No matches found</p>
                )}
            </div>
        </div>
    );
}