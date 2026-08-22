import React, { useState, useEffect, useCallback } from "react";

import {
  StaffContext,
  type GlobalMatchingData,
  type MenteesWaitingData,
  type MentorData,
  type MenteeData,
  type Match,
} from "@/lib/context/StaffContext";

import { getMentees, getMentors, getOverview } from "@/services/staffService";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalMatchingData, setGlobalMatchingData] =
    useState<GlobalMatchingData | null>(null);

  const [menteesWaitingData, setMenteesWaitingData] =
    useState<MenteesWaitingData>([]);

  const [mentorsData, setMentorsData] = useState<MentorData[]>([]);
  const [menteesData, setMenteesData] = useState<MenteeData[]>([]);

  const [mentorTotal, setMentorTotal] = useState(0);
  const [menteeTotal, setMenteeTotal] = useState(0);

  const [mentorSearch, setMentorSearch] = useState("");
  const [menteeSearch, setMenteeSearch] = useState("");

  const [mentorPage, setMentorPage] = useState(1);
  const [menteePage, setMenteePage] = useState(1);

  const mentorLimit = 10;
  const menteeLimit = 10;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchStaffData = useCallback(async () => {
    const [overviewResponse, mentorsResponse, menteesResponse] =
      await Promise.all([
        getOverview(),
        getMentors({
          search: mentorSearch || undefined,
          page: mentorPage,
          limit: mentorLimit,
        }),
        getMentees({
          search: menteeSearch || undefined,
          page: menteePage,
          limit: menteeLimit,
        }),
      ]);

    return {
      overview: overviewResponse.data,
      mentors: mentorsResponse.data.mentors,
      mentorTotal: mentorsResponse.data.total,
      mentees: menteesResponse.data.mentees,
      menteeTotal: menteesResponse.data.total,
    };
  }, [
    mentorSearch,
    mentorPage,
    mentorLimit,
    menteeSearch,
    menteePage,
    menteeLimit,
  ]);

  const refetch = async () => {
    setIsLoading(true);

    try {
      const data = await fetchStaffData();

      setGlobalMatchingData(data.overview);
      setMenteesWaitingData(data.overview.waitingMentees ?? []);
      setMentorsData(data.mentors ?? []);
      setMenteesData(data.mentees ?? []);
      setMentorTotal(data.mentorTotal);
      setMenteeTotal(data.menteeTotal);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to fetch admin programme data.",
      );
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const data = await fetchStaffData();

        if (cancelled) {
          return;
        }

        setGlobalMatchingData(data.overview);
        setMenteesWaitingData(data.overview.waitingMentees ?? []);
        setMentorsData(data.mentors ?? []);
        setMenteesData(data.mentees ?? []);
        setMentorTotal(data.mentorTotal);
        setMenteeTotal(data.menteeTotal);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = getApiErrorMessage(
          error,
          "Failed to fetch admin programme data.",
        );

        console.error(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [fetchStaffData]);

  const mentorData: MentorData | null = null;
  const menteeData: MenteeData | null = null;

  const mentorMatches: Match[] = [];
  const menteeMatches: Match[] = [];

  const handleMentorSearch = (search: string) => {
    setMentorSearch(search);
    setMentorPage(1);
  };

  const handleMenteeSearch = (search: string) => {
    setMenteeSearch(search);
    setMenteePage(1);
  };

  return (
    <StaffContext.Provider
      value={{
        globalMatchingData,
        menteesWaitingData,
        mentorData,
        mentorsData,
        mentorMatches,
        menteeData,
        menteesData,
        menteeMatches,
        isLoading,
        refetch,
        mentorTotal,
        menteeTotal,

        mentorSearch,
        menteeSearch,

        mentorPage,
        menteePage,

        mentorLimit,
        menteeLimit,

        setMentorSearch: handleMentorSearch,
        setMenteeSearch: handleMenteeSearch,

        setMentorPage,
        setMenteePage,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
};
