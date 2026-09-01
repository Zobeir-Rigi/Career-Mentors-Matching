import React, { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { type AuthUser, logout as apiLogout } from "../../services/authService";
import { getMentorProfile } from "../../services/mentorService";
import { getMenteeProfile } from "../../services/menteeService";
import type { UserProfile } from "./AuthContext";
import { api } from "../../services/api";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfileForUser = async (
    targetUser: AuthUser,
  ): Promise<UserProfile> => {
    try {
      if (targetUser.role === "MENTOR") {
        return await getMentorProfile();
      } else if (targetUser.role === "MENTEE") {
        return await getMenteeProfile();
      }
      return null;
    } catch (error) {
      console.warn(
        "Profile fetch failed or profile does not exist yet:",
        error,
      );
      return null;
    }
  };

  const refreshProfile = useCallback(
    async (targetUser?: AuthUser): Promise<UserProfile> => {
      const activeUser = targetUser || user;
      if (!activeUser) {
        setProfile(null);
        return null;
      }
      const profileData = await fetchProfileForUser(activeUser);
      setProfile(profileData);
      return profileData;
    },
    [user],
  );

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const response = await api.get<{ user: AuthUser }>("/auth/me");
        if (!isMounted) return;

        const authUser = response.data.user;
        setUser(authUser);

        const profileData = await fetchProfileForUser(authUser);
        if (isMounted) setProfile(profileData);
      } catch {
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        setUser,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
