import type { MenteeData, MentorData } from "@/lib/context/StaffContext";
import { Button } from "@components/ui/Button";

interface UserDetailsCardProps {
  userData?: MenteeData | MentorData | null;
  setSelectedUser: (user: MenteeData | MentorData | null) => void;
}

type DirectoryUser = MenteeData | MentorData;

function isMentor(user: DirectoryUser): user is MentorData {
  return "mentorProfileId" in user;
}

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "Not given";
  }

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return null;
  }

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function formatGoals(goals: string[]) {
  if (goals.length === 0) {
    return "Not given";
  }

  const visibleGoals = goals.slice(0, 2);
  const remainingGoals = goals.length - visibleGoals.length;

  return remainingGoals > 0
    ? `${visibleGoals.join(", ")} +${remainingGoals} more`
    : visibleGoals.join(", ");
}

export function UserDetailsCard({
  userData,
  setSelectedUser,
}: UserDetailsCardProps) {
  if (!userData) {
    return null;
  }

  const mentor = isMentor(userData);

  const profileUrl = normalizeUrl(
    mentor ? userData.linkedinURL : userData.links,
  );

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="quiet"
        onClick={() => setSelectedUser(null)}
        className="mb-4 h-auto min-h-0 px-0 py-0 text-accent underline hover:bg-transparent"
      >
        {mentor ? "← Back to mentors" : "← Back to mentees"}
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-black leading-none text-fg sm:text-4xl">
              {userData.fullName}
            </h1>

            <span className="rounded-full bg-tint px-3 py-1 font-sans text-xs font-semibold text-accent">
              {mentor ? "MENTOR" : "MENTEE"}
            </span>
          </div>

          {mentor && (
            <p className="mt-2 font-sans text-sm text-muted sm:text-base">
              {userData.currentJobTitle || "Job title not given"}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 rounded-lg border border-line bg-surface p-5 sm:p-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="mb-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              Email
            </p>

            <a
              href={`mailto:${userData.email}`}
              className="font-sans text-sm text-accent underline sm:text-[15px]"
            >
              {userData.email}
            </a>
          </div>

          <div className="mb-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              {mentor ? "Disciplines" : "Goals"}
            </p>

            <p className="font-sans text-sm text-fg sm:text-[15px]">
              {mentor
                ? userData.disciplines.length > 0
                  ? userData.disciplines.join(", ")
                  : "Not given"
                : formatGoals(userData.goals)}
            </p>
          </div>

          <div className="mb-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              {mentor ? "Capacity" : "Goals notes"}
            </p>

            {mentor ? (
              <p
                className={`font-sans text-sm font-semibold sm:text-[15px] ${
                  userData.capacity.isFull ? "text-error" : "text-ok"
                }`}
              >
                {userData.capacity.filled}/{userData.capacity.total}{" "}
                {userData.capacity.isFull ? "full" : "open"}
              </p>
            ) : (
              <p className="font-sans text-sm text-fg sm:text-[15px]">
                {userData.goalsNotes || "Not given"}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              Joined
            </p>

            <p className="font-sans text-sm text-fg sm:text-[15px]">
              {userData.createdAt
                ? new Date(userData.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Not available"}
            </p>
          </div>

          <div className="mb-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              Location
            </p>

            <p className="font-sans text-sm text-fg sm:text-[15px]">
              {formatLabel(userData.region)}
            </p>
          </div>

          {mentor && (
            <>
              <div className="mb-4">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
                  Approval status
                </p>

                <p
                  className={`font-sans text-sm font-semibold sm:text-[15px] ${
                    userData.approvalStatus === "ACCEPTED"
                      ? "text-ok"
                      : userData.approvalStatus === "DECLINED"
                        ? "text-error"
                        : "text-accent"
                  }`}
                >
                  {userData.approvalStatus === "ACCEPTED"
                    ? "Approved"
                    : formatLabel(userData.approvalStatus)}
                </p>
              </div>

              <div className="mb-4">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
                  Bio
                </p>

                <p className="font-sans text-sm text-fg sm:text-[15px]">
                  {userData.bio || "Not given"}
                </p>
              </div>
            </>
          )}
        </div>

        <div>
          <div className="mb-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              LinkedIn
            </p>

            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block max-w-full truncate font-sans text-sm text-accent hover:underline sm:text-[15px]"
              >
                {mentor ? userData.linkedinURL : userData.links}
              </a>
            ) : (
              <p className="font-sans text-sm text-fg sm:text-[15px]">
                None on file
              </p>
            )}
          </div>

          <div className="mb-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              Availability
            </p>

            <p className="font-sans text-sm text-fg sm:text-[15px]">
              {userData.availability.length > 0
                ? userData.availability.map(formatLabel).join(", ")
                : "Not given"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
