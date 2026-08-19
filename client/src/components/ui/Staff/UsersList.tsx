import type { MenteesWaitingData, MentorsData } from "@lib/context/StaffContext";
import { useState } from "react";

interface UsersListProps {
    userType: string;
    usersData?: MenteesWaitingData | MentorsData | [];
    setSelectedUser: CallableFunction
}

export function UsersList({ userType, usersData, setSelectedUser }: UsersListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = usersData?.filter((user) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const matchesName = user.fullName.toLowerCase().includes(query);
        const matchesEmail = user.email.toLowerCase().includes(query);
        const matchesDisciplinesOrGoals =
            "disciplines" in user
                ? user.disciplines.some((d) => d.toLowerCase().includes(query))
                : user.goals.some((g) => g.toLowerCase().includes(query));

        return matchesName || matchesEmail || matchesDisciplinesOrGoals;
    });

    return (
        <div>
            <h1 className="font-display text-4xl font-semibold overshoot">
                {`${userType} (${filteredUsers?.length ?? 0})`}
            </h1>

            <div className="mb-6 mt-6 max-w-sm">
                <label className="font-fg text-[14px] font-semibold">
                    Search {userType.toLowerCase()}
                </label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                        userType === "Mentors"
                            ? "Name, email, or discipline"
                            : "Name, email, or goals"
                    }
                    className="w-full bg-surface border border-line rounded-lg px-3.5 py-2 text-[14px] placeholder:text-muted"
                />
            </div>

            <div className="bg-surface border border-line rounded-[10px] mt-4 p-0">
                <div>
                    <div className="p-5 flex items-center">
                        <p className="font-fg text-[14px] font-semibold w-[25%] truncate">Name</p>
                        {userType == "Mentors" &&
                            <p className="font-fg text-[14px] font-semibold w-[30%] truncate pr-3">Disciplines</p>
                        }
                        {userType == "Mentors" &&
                            <p className="font-fg text-[14px] font-semibold w-[20%] truncate pr-3">Load</p>
                        }
                        {userType == "Mentors" &&
                            <p className="font-fg text-[14px] font-semibold w-[20%] truncate pr-3">Mentees</p>
                        }
                    </div>
                    <div className="-mt-px h-px w-full bg-line" />
                </div>
                {filteredUsers?.map((user) => (
                    <div key={filteredUsers.indexOf(user)}>

                        <div onClick={() => setSelectedUser(user)} className="p-5 flex items-center cursor-pointer">
                            <p className="font-sans text-[13px] w-[25%] truncate">{user.fullName}</p>
                            {"disciplines" in user && (
                                <p className="font-sans text-[13px] w-[30%] truncate pr-3">{user.disciplines.join(", ")}</p>
                            )}
                            {"capacity" in user && (
                                <p className="font-sans text-[13px] w-[20%] truncate pr-3 flex items-center gap-1.5">
                                    <span className="text-accent">
                                        {user?.matches?.length ?? 0}/{user?.capacity ?? 0}
                                    </span>
                                    <span>
                                        {(user?.matches?.length ?? 0) < Number(user?.capacity ?? 0) ? 'open' : 'full'}
                                    </span>
                                </p>
                            )}
                            {"matches" in user && (
                                <p className="font-sans text-[13px] w-[20%] truncate pr-3">{user.matches?.map((match) => match.fullName).join(", ")}</p>
                            )}

                        </div>
                        <div className="-mt-px h-px w-full bg-line" />
                    </div>
                ))}

            </div>
        </div>
    )
}