export interface MentorRecommendation {
  mentorId: string;
  userId: string;
  score: number;

  categoryScores: {
    disciplines: number;
    skills: number;
    industries: number;
    availability: number;
    location: number;
    meetingStructure: number;
    meetingCadence: number;
  };

  profile: {
    fullName: string;
    currentJobTitle: string | null;
    region: string | null;
    openToRemote: boolean;
    bio: string | null;
    linkedinURL: string | null;
  };
}
