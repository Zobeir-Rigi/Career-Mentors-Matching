import { createContext, useContext } from "react";

export type UserRole = "mentor" | "mentee";

// Shared properties across all user roles
interface BaseProfileContext {
  // About

  bio: string;
  setBio: (val: string) => void;

  linkedinURL: string;
  setLinkedinURL: (val: string) => void;

  scheduleURL?: string;
  setScheduleURL: (val: string) => void;

  region: string;
  setRegion: (val: string) => void;

  openToRemote: boolean;
  setOpenToRemote: (val: boolean) => void;

  // Multi-select collections
  selectedAvailability: Set<string>;
  toggleAvailability: (option: string) => void;
  setAvailability: (items: string[]) => void;

  selectedDisciplines: Set<string>;
  toggleDisciplines: (option: string) => void;
  setDisciplines: (items: string[]) => void;

  selectedSkills: Set<string>;
  toggleSkills: (option: string) => void;
  setSkills: (items: string[]) => void;

  selectedIndustries: Set<string>;
  toggleIndustries: (option: string) => void;
  setIndustries: (items: string[]) => void;

  // Meeting preferences
  meetingCadence: string;
  setMeetingCadence: (val: string) => void;

  meetingStructure: string;
  setMeetingStructure: (val: string) => void;

  // System status flags (returned from API)
  isProfileComplete: boolean;
  setIsProfileComplete: (val: boolean) => void;

  isMatchReady: boolean;
  setIsMatchReady: (val: boolean) => void;
}

// Mentor-specific context type
export interface MentorProfileContextType extends BaseProfileContext {
  role: "mentor";
  currentJobTitle: string;
  setCurrentJobTitle: (val: string) => void;
  capacity: number;
  setCapacity: (val: number) => void;
  approvalStatus: string;
  setApprovalStatus: (val: string) => void;
  isAcceptingMentees: boolean;
  setIsAcceptingMentees: (val: boolean) => void;
}

// Mentee-specific context type
export interface MenteeProfileContextType extends BaseProfileContext {
  role: "mentee";
  currentJobTitle?: string;
  setCurrentJobTitle: (val: string) => void;
  reasonNote: string;
  setReasonNote: (val: string) => void;
}

// Discriminated union combining both roles
export type ProfileContextType =
  | MentorProfileContextType
  | MenteeProfileContextType;

export const MentorProfileContext = createContext<
  ProfileContextType | undefined
>(undefined);

export function useProfile() {
  const context = useContext(MentorProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  return context;
}
