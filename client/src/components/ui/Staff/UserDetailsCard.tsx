interface UserData {
    status?: "MENTOR" | "MENTEE" | string;
    fullName?: string;
    email?: string;
    disciplines?: string[];
    goals?: string[];
    capacity?: number | string;
    goalsNotes?: string;
    joined?: string;
    location?: string;
    bio?: string;
    links?: string;
    availability?: string[];
}

interface UserDetailsCardProps {
    userData?: UserData | null;
}
export function UserDetailsCard({ userData }: UserDetailsCardProps) {
    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <p className="font-sans text-[15px] text-accent mb-4 underline">{userData?.status === "MENTOR" ? "← Back to mentors" : "← Back to mentees"}</p>
            <div className="flex flex-row items-center gap-3">
                <h1 className="font-display text-4xl font-semibold leading-none">
                    {userData?.fullName}
                </h1>
                <div className="rounded-[24px] bg-tint ml-10 px-3 py-1">
                    <p className="font-sans text-[12px] font-medium leading-none text-accent">
                        {userData?.status}
                    </p>
                </div>
            </div>
            <div>
            </div>
            <div className="bg-surface border border-line rounded-[10px] mt-4 p-6 grid grid-cols-1 md:grid-cols-3">
                <div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">EMAIL</p>
                        <p className="font-sans text-[15px] text-accent underline">{userData?.email}</p>
                    </div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">
                            {userData?.status === "MENTOR" ? "DISCIPLINES" : "GOALS"}
                        </p>
                        <p className="font-sans text-[15px] text-fg">
                            {userData.status === "MENTOR"
                                ? userData.disciplines?.join(", ")
                                : userData.goals?.join(", ")}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">{userData?.status === "MENTOR" ? "CAPACITY" : "GOALS NOTES"}</p>
                        <p className="font-sans text-[15px] text-fg">{userData?.status === "MENTOR" ? userData?.capacity : userData?.goalsNotes}</p>
                    </div>
                </div>
                <div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">JOINED</p>
                        <p className="font-sans text-[15px] text-fg">{userData?.joined}</p>
                    </div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">LOCATION</p>
                        <p className="font-sans text-[15px] text-fg">{userData?.location}</p>
                    </div>
                    {userData?.status === "MENTOR" && (
                        <div className="mb-4">
                            <p className="font-sans text-[12px] text-muted">BIO</p>
                            <p className="font-sans text-[15px] text-fg">{userData?.bio}</p>
                        </div>
                    )}
                </div>
                <div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">LINKS</p>
                        <p className="font-sans text-[15px] text-fg">{userData?.links}</p>
                    </div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">AVAILABILITY</p>
                        <p className="font-sans text-[15px] text-fg">{userData?.availability?.join(", ") ?? "Not given"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}