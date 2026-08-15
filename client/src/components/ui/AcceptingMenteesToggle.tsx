import { useState } from "react";
import { Switch } from "./Switch";
import { useAuth } from "@/lib/context/useAuth";
import {
  updateMentorProfile,
  isMentorProfileResponse,
} from "@/services/mentorService";

interface AcceptingMenteesToggleProps {
  className?: string;
}

export function AcceptingMenteesToggle({
  className = "",
}: AcceptingMenteesToggleProps) {
  const { profile, refreshProfile } = useAuth();

  const mentorProfile = isMentorProfileResponse(profile) ? profile : null;

  const [optimisticChecked, setOptimisticChecked] = useState<boolean | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isChecked =
    optimisticChecked ?? Boolean(mentorProfile?.isAcceptingMentees);

  const handleToggle = async (nextState: boolean) => {
    setError(null);
    setIsUpdating(true);
    setOptimisticChecked(nextState);

    try {
      await updateMentorProfile({ isAcceptingMentees: nextState });
      await refreshProfile();
    } catch (err) {
      setError("Failed to update");
      console.error("Failed to toggle accepting mentees:", err);
    } finally {
      setOptimisticChecked(null);
      setIsUpdating(false);
    }
  };

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg border border-line bg-surface shadow-sm">
        <label
          htmlFor="accepting-mentees-switch"
          className="font-medium text-xs text-fg cursor-pointer select-none"
        >
          {isChecked ? "Accepting mentees" : "Not accepting mentees"}
        </label>

        <Switch
          id="accepting-mentees-switch"
          checked={isChecked}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
        />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
