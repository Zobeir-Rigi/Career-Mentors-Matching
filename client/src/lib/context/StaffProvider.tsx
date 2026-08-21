import React, { useState, useEffect, useCallback } from "react";
import {
    StaffContext,
    type GlobalMatchingData,
    type MentorData,
    type MenteeData,
} from "@/lib/context/StaffContext";
import { getStaffData } from "@/services/staffService";
export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalMatchingData, setGlobalMatchingData] = useState<GlobalMatchingData | null>(null);
    const [mentorsData, setMentorsData] = useState<MentorData[]>([]);
    const [menteesData, setMenteesData] = useState<MenteeData[]>([]);
    const refetch = useCallback(async () => {
        setIsLoading(true);

        try {
            const [overviewRes, mentorsRes, menteesRes] = await Promise.allSettled([
                getStaffData("overview"),
                getStaffData("mentors"),
                getStaffData("mentees"),
            ]);

            if (overviewRes.status === "fulfilled" && overviewRes.value?.data) {
                const data = overviewRes.value.data;
                setGlobalMatchingData({
                    applicantsNumber: data.openMenteePlaces,
                    volunteerMentors: data.volunteerMentors,
                    openMenteePlaces: data.openMenteePlaces,
                    liveMatches: data.liveMatches,
                    menteesWaiting: data.menteesWaiting,
                });
            } else {
                setGlobalMatchingData(null);
            }

            if (mentorsRes.status === "fulfilled" && mentorsRes.value) {
                const res = mentorsRes.value;
                setMentorsData(res.data?.mentors ?? (Array.isArray(res) ? res : []));
            } else {
                setMentorsData([]);
            }

            if (menteesRes.status === "fulfilled" && menteesRes.value) {
                const res = menteesRes.value;
                setMenteesData(res.data?.mentees ?? (Array.isArray(res) ? res : []));
            } else {
                setMenteesData([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        Promise.resolve().then(() => {
            if (isMounted) {
                refetch();
            }
        });

        return () => {
            isMounted = false;
        };
    }, [refetch]);

    return (
        <StaffContext.Provider
            value={{
                globalMatchingData,
                menteesData,
                isLoading,
                mentorsData,
                refetch,
            }}
        >
            {children}
        </StaffContext.Provider>
    );
};