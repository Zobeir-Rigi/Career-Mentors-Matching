import { createContext, useContext, useState, ReactNode } from "react";
import { optionsSetHandler } from "../../lib/utils";

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
