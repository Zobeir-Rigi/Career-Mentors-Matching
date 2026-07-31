import { useState, type ReactNode } from "react";
import { MentorProfileContext } from "./MentorProfileContext";
import { useToggleSet } from "../hooks/useToggleSet";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [scheduleUrl, setScheduleUrl] = useState("");
  const [region, setRegion] = useState("");
  const [isRemote, setIsRemote] = useState(false);

  const [selectedAvailability, toggleAvailability] = useToggleSet();
  const [selectedDisciplines, toggleDisciplines] = useToggleSet();
  const [capacity, setCapacity] = useState(1);
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
