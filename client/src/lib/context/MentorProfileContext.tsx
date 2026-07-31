import { createContext, useContext, useState, ReactNode } from "react";
import { useToggleSet } from "../hooks/useToggleSet";

interface MentorProfileContextType {
  // About you
  jobTitle: string;
  setJobTitle: (val: string) => void;

  bio: string;
  setBio: (val: string) => void;

  linkedInUrl: string;
  setLinkedInUrl: (val: string) => void;

  scheduleUrl: string;
  setScheduleUrl: (val: string) => void;

  region: string;
  setRegion: (val: string) => void;

  isRemote: boolean;
  setIsRemote: (val: boolean) => void;

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

const MentorProfileContext = createContext<
  MentorProfileContextType | undefined
>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [scheduleUrl, setScheduleUrl] = useState("");
  const [region, setRegion] = useState("");
  const [isRemote, setIsRemote] = useState(false);

  const [selectedAvailability, toggleAvailability] = useToggleSet();
  const [selectedDisciplines, toggleDisciplines] = useToggleSet();
  const [capacity, setCapacity] = useState(0);
  const [selectedSkills, toggleSkills] = useToggleSet();
  const [selectedIndustries, toggleIndustries] = useToggleSet();
  const [meetingCadence, setMeetingCadence] = useState("");
  const [meetingStructure, setMeetingStructure] = useState("");

  const value = {
    jobTitle,
    setJobTitle,
    bio,
    setBio,
    linkedInUrl,
    setLinkedInUrl,
    scheduleUrl,
    setScheduleUrl,
    region,
    setRegion,
    isRemote,
    setIsRemote,
    selectedAvailability,
    toggleAvailability,
    selectedDisciplines,
    toggleDisciplines,
    capacity,
    setCapacity,
    selectedSkills,
    toggleSkills,
    selectedIndustries,
    toggleIndustries,
    meetingCadence,
    setMeetingCadence,
    meetingStructure,
    setMeetingStructure,
  };

  return (
    <MentorProfileContext.Provider value={value}>
      {children}
    </MentorProfileContext.Provider>
  );
}
