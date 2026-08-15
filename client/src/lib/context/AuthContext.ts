import { createContext } from "react";
import type { AuthUser } from "../../services/authService";
import type { MentorProfileResponse } from "../../services/mentorService";
import type { MenteeProfileResponse } from "../../services/menteeService";

export type UserProfile = MentorProfileResponse | MenteeProfileResponse | null;

export interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  refreshProfile: (targetUser?: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
