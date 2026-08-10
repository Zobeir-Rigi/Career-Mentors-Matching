import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/useAuth";

export type ApprovalStatus = "PENDING" | "ACCEPTED" | "DECLINED";

interface MentorStatusBadgeProps {
  className?: string;
}

export function MentorStatusBadge({ className }: MentorStatusBadgeProps) {
  const { profile } = useAuth();

  if (!profile) return null;

  const { isProfileComplete, isMatchReady } = profile;
  const approvalStatus = (profile.approvalStatus?.toUpperCase() ||
    "PENDING") as ApprovalStatus;

  if (!isProfileComplete) {
    return (
      <span
        className={cn(
          "px-3 py-1 text-xs font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200",
          className,
        )}
      >
        Incomplete Profile
      </span>
    );
  }

  if (approvalStatus === "ACCEPTED") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-green-50 text-green-700 border-green-200">
          Profile Approved
        </span>
        {isMatchReady && (
          <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-blue-50 text-blue-700 border-blue-200">
            Match Ready
          </span>
        )}
      </div>
    );
  }

  if (approvalStatus === "DECLINED") {
    return (
      <span
        className={cn(
          "px-3 py-1 text-xs font-semibold rounded-full border bg-red-50 text-red-700 border-red-200",
          className,
        )}
      >
        Action Required
      </span>
    );
  }

  return (
    <span
      className={cn(
        "px-3 py-1 text-xs font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200",
        className,
      )}
    >
      Pending Admin Approval
    </span>
  );
}
