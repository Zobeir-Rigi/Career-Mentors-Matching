import { useState } from "react";
import {
  MentorProfileContext,
  type ProfileContextType,
  type MentorProfileContextType,
  type MenteeProfileContextType,
} from "./ProfileContext";
import { useToggleSet } from "../hooks/useToggleSet";

interface ProfileProviderProps {
  role: "mentor" | "mentee";
  children: React.ReactNode;
}

export function ProfileProvider({ role, children }: ProfileProviderProps) {
  // shared fields
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinURL, setLinkedinURL] = useState("");
  const [scheduleURL, setScheduleURL] = useState("");
  const [region, setRegion] = useState("");
  const [openToRemote, setOpenToRemote] = useState(false);

  // Multi-select sets
  const [selectedAvailability, toggleAvailability, setAvailability] =
    useToggleSet();
  const [selectedDisciplines, toggleDisciplines, setDisciplines] =
    useToggleSet();
  const [selectedSkills, toggleSkills, setSkills] = useToggleSet();
  const [selectedIndustries, toggleIndustries, setIndustries] = useToggleSet();

  // Meeting preferences
  const [meetingCadence, setMeetingCadence] = useState("");
  const [meetingStructure, setMeetingStructure] = useState("");

  // Shared status flags from API
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isMatchReady, setIsMatchReady] = useState(false);

  // Mentor-only state
  const [capacity, setCapacity] = useState(1);
  const [approvalStatus, setApprovalStatus] = useState("PENDING");
  const [isAcceptingMentees, setIsAcceptingMentees] = useState(false);

  // Mentee-only state
  const [reasonNote, setReasonNote] = useState("");

  const baseContext = {
    bio,
    setBio,
    linkedinURL,
    setLinkedinURL,
    scheduleURL,
    setScheduleURL,
    region,
    setRegion,
    openToRemote,
    setOpenToRemote,
    selectedAvailability,
    toggleAvailability,
    setAvailability,
    selectedDisciplines,
    toggleDisciplines,
    setDisciplines,
    selectedSkills,
    toggleSkills,
    setSkills,
    selectedIndustries,
    toggleIndustries,
    setIndustries,
    meetingCadence,
    setMeetingCadence,
    meetingStructure,
    setMeetingStructure,
    isProfileComplete,
    setIsProfileComplete,
    isMatchReady,
    setIsMatchReady,
  };

  const value: ProfileContextType =
    role === "mentor"
      ? ({
          ...baseContext,
          role: "mentor",
          currentJobTitle,
          setCurrentJobTitle,
          capacity,
          setCapacity,
          approvalStatus,
          setApprovalStatus,
          isAcceptingMentees,
          setIsAcceptingMentees,
        } satisfies MentorProfileContextType)
      : ({
          ...baseContext,
          role: "mentee",
          currentJobTitle,
          setCurrentJobTitle,
          reasonNote,
          setReasonNote,
        } satisfies MenteeProfileContextType);

  return (
    <MentorProfileContext.Provider value={value}>
      {children}
    </MentorProfileContext.Provider>
  );
}
