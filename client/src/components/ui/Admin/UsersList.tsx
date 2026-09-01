import type {
  MenteeData,
  MenteesData,
  MentorData,
  MentorsData,
} from "@lib/context/AdminContext";

import { useAdmin } from "@/lib/context/AdminContext";
import { updateMentorApproval } from "@/services/adminService";

import { Input } from "../Input";
import { Button } from "../Button";

interface UsersListProps {
  userType: "Mentors" | "Mentees";
  usersData: MenteesData | MentorsData;
  total: number;
  searchQuery: string;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  setSelectedUser: (user: MenteeData | MentorData) => void;
}

type DirectoryUser = MentorData | MenteeData;
type MentorApprovalStatus = MentorData["approvalStatus"];

function isMentor(user: DirectoryUser): user is MentorData {
  return "mentorProfileId" in user;
}

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function UsersList({
  userType,
  usersData,
  total,
  searchQuery,
  onSearchChange,
  setSelectedUser,
}: UsersListProps) {
  const { refetch } = useAdmin();

  const isMentorList = userType === "Mentors";

  async function handleApproval(
    mentorProfileId: string,
    approvalStatus: MentorApprovalStatus,
  ) {
    await updateMentorApproval(mentorProfileId, approvalStatus);
    await refetch();
  }

  return (
    <div>
      <h1 className="overshoot font-display text-4xl font-black">
        {userType} ({total})
      </h1>

      <div className="mb-6 mt-6 max-w-sm">
        <Input
          id={`${userType.toLowerCase()}-search`}
          type="search"
          label={`Search ${userType.toLowerCase()}`}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={
            isMentorList
              ? "Name, email, or discipline"
              : "Name, email, or goals"
          }
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
        {/* TABLE HEADER */}
        <div className="flex w-full items-center">
          <div className="flex flex-1 items-center p-5">
            <p className="w-[20%] truncate font-sans text-sm font-semibold text-fg">
              Name
            </p>

            <p className="w-[25%] truncate pr-3 font-sans text-sm font-semibold text-fg">
              {isMentorList ? "Job title" : "Goals"}
            </p>

            <p className="w-[15%] truncate pr-3 font-sans text-sm font-semibold text-fg">
              {isMentorList ? "Capacity" : "Mentor"}
            </p>

            <p className="w-[25%] truncate pr-3 font-sans text-sm font-semibold text-fg">
              {isMentorList ? "Mentees" : "Status"}
            </p>
          </div>

          {isMentorList && (
            <div className="w-[15%] pr-5">
              <p className="truncate font-sans text-sm font-semibold text-fg">
                Approval
              </p>
            </div>
          )}
        </div>

        <div className="h-px w-full bg-line" />

        {/* EMPTY STATE */}
        {usersData.length === 0 ? (
          <p className="p-5 font-sans text-sm text-muted">
            No {userType.toLowerCase()} found.
          </p>
        ) : (
          usersData.map((user) => {
            const mentor = isMentor(user);

            return (
              <div key={mentor ? user.mentorProfileId : user.menteeProfileId}>
                <div className="flex w-full items-center">
                  <Button
                    type="button"
                    variant="quiet"
                    onClick={() => setSelectedUser(user)}
                    className="flex h-auto flex-1 items-center justify-start rounded-none p-5 text-left hover:bg-tint"
                  >
                    {/* NAME */}
                    <p className="w-[20%] truncate font-sans text-[13px] text-fg">
                      {user.fullName}
                    </p>

                    {/* JOB TITLE / GOALS */}
                    <p className="w-[25%] truncate pr-3 font-sans text-[13px] text-fg">
                      {mentor ? (
                        user.currentJobTitle || "—"
                      ) : user.goals.length > 0 ? (
                        <>
                          {user.goals.slice(0, 2).join(", ")}
                          {user.goals.length > 2 && (
                            <span className="text-muted">
                              {` +${user.goals.length - 2} more`}
                            </span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </p>

                    {/* CAPACITY / CURRENT MENTOR */}
                    {mentor ? (
                      <Capacity capacity={user.capacity} />
                    ) : (
                      <p className="w-[15%] truncate pr-3 font-sans text-[13px] text-fg">
                        {user.mentor?.fullName ?? "—"}
                      </p>
                    )}

                    {/* MATCHED MENTEES &  MATCH STATUS */}
                    {mentor ? (
                      <p className="w-[25%] truncate pr-3 font-sans text-[13px] text-fg">
                        {user.matchedMentees.length > 0
                          ? user.matchedMentees
                              .map((mentee) => mentee.fullName)
                              .join(", ")
                          : "—"}
                      </p>
                    ) : (
                      <div className="w-[25%] pr-3">
                        <MatchStatus status={user.status} />
                      </div>
                    )}
                  </Button>

                  {mentor && (
                    <div className="w-[15%] pr-5">
                      <ApprovalSelect
                        mentorProfileId={user.mentorProfileId}
                        status={user.approvalStatus}
                        onUpdate={handleApproval}
                      />
                    </div>
                  )}
                </div>

                <div className="h-px w-full bg-line" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Capacity({ capacity }: { capacity: MentorData["capacity"] }) {
  const capacityColour = capacity.isFull ? "text-error" : "text-ok";

  return (
    <div className="flex w-[15%] items-center gap-1.5 pr-3 font-sans text-[13px]">
      <span className={capacityColour}>
        {capacity.filled}/{capacity.total}
      </span>

      <span className={capacityColour}>
        {capacity.isFull ? "full" : "open"}
      </span>
    </div>
  );
}

/*
 * Mentee match status
 */
function MatchStatus({ status }: { status: string | null }) {
  if (!status) {
    return <span className="font-sans text-[13px] text-muted">—</span>;
  }

  const className =
    status === "ACTIVE" ? "bg-ok-tint text-ok" : "bg-tint text-accent";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 font-sans text-xs ${className}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}

/*
 * Mentor approval dropdown
 * PENDING | ACCEPTED | DECLINED
 */
function ApprovalSelect({
  mentorProfileId,
  status,
  onUpdate,
}: {
  mentorProfileId: string;
  status: MentorApprovalStatus;
  onUpdate: (
    mentorProfileId: string,
    status: MentorApprovalStatus,
  ) => Promise<void>;
}) {
  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = event.target.value as MentorApprovalStatus;

    if (newStatus === status) {
      return;
    }

    await onUpdate(mentorProfileId, newStatus);
  }

  const statusColour =
    status === "ACCEPTED"
      ? "text-ok"
      : status === "DECLINED"
        ? "text-error"
        : "text-accent";

  return (
    <select
      value={status}
      onChange={handleChange}
      aria-label="Mentor approval status"
      className={`w-full rounded-md border border-line bg-surface px-2 py-2 font-sans text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${statusColour}`}
    >
      <option value="PENDING">Pending</option>
      <option value="ACCEPTED">Approved</option>
      <option value="DECLINED">Declined</option>
    </select>
  );
}
