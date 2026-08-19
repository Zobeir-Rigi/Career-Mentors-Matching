import type { MenteesData, MentorsData } from "@lib/context/StaffContext";
import { useState } from "react";

interface UsersListProps {
    userType: string;
    usersData?: MenteesData | MentorsData | [];
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
                        {userType == "Mentees" &&
                            <p className="font-fg text-[14px] font-semibold w-[30%] truncate pr-3">Goals</p>
                        }
                        {userType == "Mentors" &&
                            <p className="font-fg text-[14px] font-semibold w-[20%] truncate pr-3">Load</p>
                        }
                        {userType == "Mentees" &&
                            <p className="font-fg text-[14px] font-semibold w-[20%] truncate pr-3">Mentor</p>
                        }
                        {userType == "Mentors" &&
                            <p className="font-fg text-[14px] font-semibold w-[20%] truncate pr-3">Mentees</p>
                        }
                        {userType == "Mentees" &&
                            <p className="font-fg text-[14px] font-semibold w-[20%] truncate pr-3">Status</p>
                        }
                    </div>
                    <div className="-mt-px h-px w-full bg-line" />
                </div>
                {filteredUsers?.map((user, index) => {
                    const matches = "matches" in user && Array.isArray(user.matches) ? user.matches : [];
                    const lastMatch = matches.length > 0
                        ? [...matches].sort(
                            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
                        )[0] : null;

                    return (
                        <div key={user.email || index}>
                            <div onClick={() => setSelectedUser(user)} className="p-5 flex items-center cursor-pointer">
                                <p className="font-sans text-[13px] w-[25%] truncate">{user.fullName}</p>

                                {"disciplines" in user && (
                                    <p className="font-sans text-[13px] w-[30%] truncate pr-3">
                                        {user.disciplines.join(", ")}
                                    </p>
                                )}

                                {"goals" in user && (
                                    <p className="font-sans text-[13px] w-[30%] truncate pr-3">
                                        {user.goals.join(", ")}
                                    </p>
                                )}

                                {"capacity" in user && (
                                    <p className="font-sans text-[13px] w-[20%] truncate pr-3 flex items-center gap-1.5">
                                        <span className="text-accent">
                                            {matches.length}/{user?.capacity ?? 0}
                                        </span>
                                        <span>
                                            {matches.length < Number(user?.capacity ?? 0) ? "open" : "full"}
                                        </span>
                                    </p>
                                )}

                                {"matches" in user && (
                                    <p className="font-sans text-[13px] w-[20%] truncate pr-3">
                                        {lastMatch?.fullName ? lastMatch.fullName : "—"}
                                    </p>
                                )}

                                {userType === "Mentees" && (
                                    <div className="w-[20%] pr-3">
                                        {lastMatch?.status === "ACTIVE" ? (
                                            <div className="flex h-[22px] w-fit items-center justify-center rounded-[11px] bg-ok-tint px-3">
                                                <p className="font-sans text-[12px] leading-none text-ok">{lastMatch.status}</p>
                                            </div>
                                        ) : lastMatch?.status === "CHEMISTRY_CONFIRMED" ? (
                                            <div className="flex h-[22px] w-fit items-center justify-center rounded-[11px] bg-tint px-3">
                                                <p className="font-sans text-[12px] leading-none text-muted">{lastMatch.status}</p>
                                            </div>
                                        ) : lastMatch?.status ? (
                                            <div className="flex h-[22px] w-fit items-center justify-center rounded-[11px] bg-tint px-3">
                                                <p className="font-sans text-[12px] leading-none text-accent">{lastMatch.status}</p>
                                            </div>
                                        ) : (
                                            <span className="font-sans text-[13px] text-muted">—</span>
                                        )}
                                    </div>
                                )}

                            </div>
                            <div className="-mt-px h-px w-full bg-line" />
                        </div>
                    );
                })}

            </div>
        </div>
    )
}