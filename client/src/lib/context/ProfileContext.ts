import { createContext, useContext } from "react";

type UserRole = "mentor" | "mentee";
interface ProfileContextType {
  role: UserRole;

  // About you
  jobTitle: string;
  setJobTitle: (val: string) => void;
  
  reasonNote: string;
  setReasonNote: (val: string) => void;
  
  bio: string;
  setBio: (val: string) => void;

  linkedInUrl: string;
  setLinkedInUrl: (val: string) => void;

  scheduleUrl: string;
  setScheduleUrl: (val: string) => void;

  region: string;
  setRegion: (val: string) => void;

  openToRemote: boolean;
  setOpenToRemote: (val: boolean) => void;

  // Availability
  selectedAvailability: Set<string>;
  toggleAvailability: (option: string) => void;

  // Disciplines
  selectedDisciplines: Set<string>;
  toggleDisciplines: (option: string) => void;

  // Capacity
  capacity: number;
  setCapacity: (val: number) => void;

  // SKills
  selectedSkills: Set<string>;
  toggleSkills: (option: string) => void;

  // Industries
  selectedIndustries: Set<string>;
  toggleIndustries: (option: string) => void;

  // Meeting cadence
  meetingCadence: string;
  setMeetingCadence: (val: string) => void;

  // Meeting structure
  meetingStructure: string;
  setMeetingStructure: (val: string) => void;
}

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
