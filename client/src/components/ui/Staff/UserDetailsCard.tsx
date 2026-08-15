import type { MenteeData, MentorData } from "@/lib/context/StaffContext";

interface UserDetailsCardProps {
    userData?: MenteeData | MentorData | null;
    setSelectedUser: CallableFunction
}
export function UserDetailsCard({ userData, setSelectedUser }: UserDetailsCardProps) {
    if (!userData) {
        return null;
    }
    return (
        <div>
            <p onClick={() => setSelectedUser(null)} className="font-sans text-[15px] text-accent mb-4 underline cursor-pointer">{userData?.role === "MENTOR" ? "← Back to mentors" : "← Back to mentees"}</p>
            <div className="flex flex-row items-center gap-3">
                <h1 className="font-display text-4xl font-semibold leading-none">
                    {userData?.fullName}
                </h1>
                <div className="rounded-[24px] bg-tint ml-10 px-3 py-1">
                    <p className="font-sans text-[12px] font-medium leading-none text-accent">
                        {userData?.role}
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
                            {userData?.role === "MENTOR" ? "DISCIPLINES" : "GOALS"}
                        </p>
                        <p className="font-sans text-[15px] text-fg">
                            {"disciplines" in userData
                                ? userData.disciplines?.join(", ")
                                : userData.goals?.join(", ")}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">{userData?.role === "MENTOR" ? "CAPACITY" : "GOALS NOTES"}</p>
                        <p className="font-sans text-[15px] text-fg">{"capacity" in userData ? userData.capacity : userData.goalsNotes}</p>
                    </div>
                </div>
                <div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">JOINED</p>
                        <p className="font-sans text-[15px] text-fg">
                            {userData?.createdAt
                                ? new Date(userData.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : ''}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">LOCATION</p>
                        <p className="font-sans text-[15px] text-fg">{userData?.region}</p>
                    </div>
                    {userData?.role === "MENTOR" && (
                        <div className="mb-4">
                            <p className="font-sans text-[12px] text-muted">BIO</p>
                            <p className="font-sans text-[15px] text-fg">{userData?.bio}</p>
                        </div>
                    )}
                </div>
                <div>
                    <div className="mb-4">
                        <p className="font-sans text-[12px] text-muted">LINKS</p>
                        {userData?.links ? (
                            <a
                                href={userData.links}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block max-w-[200px] font-sans text-[15px] text-accent hover:underline truncate"
                            >
                                {userData.links}
                            </a>
                        ) : (
                            <p className="block max-w-[200px] font-sans text-[15px] text-fg truncate">
                                None on file
                            </p>
                        )}
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