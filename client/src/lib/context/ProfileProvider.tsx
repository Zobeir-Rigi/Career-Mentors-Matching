import { useState } from "react";
import { MentorProfileContext } from "./ProfileContext";
import { useToggleSet } from "../hooks/useToggleSet";

interface ProfileProviderProps {
  role: "mentor" | "mentee";
  children: React.ReactNode;
}

export function ProfileProvider({ role, children }: ProfileProviderProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [scheduleUrl, setScheduleUrl] = useState("");
  const [region, setRegion] = useState("");
  const [openToRemote, setOpenToRemote] = useState(false);

  const [selectedAvailability, toggleAvailability] = useToggleSet();
  const [selectedDisciplines, toggleDisciplines] = useToggleSet();
  const [capacity, setCapacity] = useState(1);
  const [selectedSkills, toggleSkills] = useToggleSet();
  const [selectedIndustries, toggleIndustries] = useToggleSet();
  const [meetingCadence, setMeetingCadence] = useState("");
  const [meetingStructure, setMeetingStructure] = useState("");

  const value = {
    role,
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
    openToRemote,
    setOpenToRemote,
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
