import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Card } from "../components/ui/Card";
import { Switch } from "../components/ui/Switch";
import { Button } from "../components/ui/Button";
import {
  availabilityOptions,
  goalOptions,
  mentorshipOptions,
  cadenceOptions,
  mentoringStyleOptions,
  industryOptions,
  regionOptions,
} from "../lib/ProfileOptions";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Textarea } from "../components/ui/Textarea";
import { PageTitle } from "../components/ui/PageTitle";
import { SectionHead } from "../components/ui/SectionHead";
import { OptionsDisplay } from "../components/ui/OptionsDisplay";
import { QuestionLabel } from "../components/ui/QuestionLabel";
import { Notice } from "../components/ui/Notice";
import { RadioGroup } from "@/components/ui/RadioGroup";

import {
  useProfile,
  type MentorProfileContextType,
} from "../lib/context/ProfileContext";
import { checkEmptyFields } from "@/lib/profileValidation";
import { useAuth } from "@/lib/context/useAuth";
import {
  upsertMentorProfile,
  isMentorProfileResponse,
  type MentorProfilePayload,
} from "@/services/mentorService";
import { getApiErrorMessage } from "@/services/getApiErrorMessages";

export function MentorProfile() {
  const navigate = useNavigate();
  const { profile, refreshProfile, isLoading: isAuthLoading } = useAuth();
  const mentorProfile = isMentorProfileResponse(profile) ? profile : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    role,
    currentJobTitle,
    setCurrentJobTitle,
    bio,
    setBio,
    linkedinURL,
    setLinkedinURL,
    scheduleURL,
    setScheduleURL,
    region,
    setRegion,
    openToRemote,
    setOpenToRemote,
    selectedAvailability,
    setAvailability,
    toggleAvailability,
    selectedDisciplines,
    setDisciplines,
    toggleDisciplines,
    capacity,
    setCapacity,
    selectedSkills,
    setSkills,
    toggleSkills,
    selectedIndustries,
    setIndustries,
    toggleIndustries,
    meetingCadence,
    setMeetingCadence,
    meetingStructure,
    setMeetingStructure,
    setIsProfileComplete,
    setIsMatchReady,
    setApprovalStatus,
    setIsAcceptingMentees,
  } = useProfile() as MentorProfileContextType;

  // Pre-fill form state when existing profile loads from AuthContext
  useEffect(() => {
    if (!mentorProfile) return;

    setCurrentJobTitle(mentorProfile.currentJobTitle || "");
    setBio(mentorProfile.bio || "");
    setLinkedinURL(
      mentorProfile.user?.linkedinURL || mentorProfile.linkedinURL || "",
    );
    setScheduleURL(mentorProfile.scheduleURL || "");
    setRegion(mentorProfile.region || "");
    setOpenToRemote(Boolean(mentorProfile.openToRemote));
    setCapacity(mentorProfile.capacity || 1);
    setMeetingCadence(mentorProfile.meetingCadence || "");
    setMeetingStructure(mentorProfile.meetingStructure || "");

    if (mentorProfile.availability) setAvailability(mentorProfile.availability);

    if (mentorProfile.mentorDisciplines?.length) {
      const extractedDisciplines = mentorProfile.mentorDisciplines.map(
        (item) => item.discipline?.name || item.disciplineId || item.name || "",
      );
      setDisciplines(extractedDisciplines);
    } else if (mentorProfile.disciplines) {
      setDisciplines(mentorProfile.disciplines);
    }

    if (mentorProfile.mentorSkills?.length) {
      const extractedSkills = mentorProfile.mentorSkills.map(
        (item) => item.skill?.name || item.skillId || item.name || "",
      );
      setSkills(extractedSkills);
    } else if (mentorProfile.skills) {
      setSkills(mentorProfile.skills);
    }

    if (mentorProfile.mentorDomainIndustries?.length) {
      const extractedIndustries = mentorProfile.mentorDomainIndustries.map(
        (item) => item.industry?.name || item.industryId || item.name || "",
      );
      setIndustries(extractedIndustries);
    } else if (mentorProfile.industries) {
      setIndustries(mentorProfile.industries);
    }

    // Populate backend status flags into Context
    if (typeof mentorProfile.isProfileComplete === "boolean") {
      setIsProfileComplete(mentorProfile.isProfileComplete);
    }
    if (typeof mentorProfile.isMatchReady === "boolean") {
      setIsMatchReady(mentorProfile.isMatchReady);
    }
    if (mentorProfile.approvalStatus) {
      setApprovalStatus(mentorProfile.approvalStatus);
    }
    if (typeof mentorProfile.isAcceptingMentees === "boolean") {
      setIsAcceptingMentees(mentorProfile.isAcceptingMentees);
    }
  }, [
    mentorProfile,
    setCurrentJobTitle,
    setBio,
    setLinkedinURL,
    setScheduleURL,
    setRegion,
    setOpenToRemote,
    setCapacity,
    setMeetingCadence,
    setMeetingStructure,
    setAvailability,
    setDisciplines,
    setSkills,
    setIndustries,
    setIsProfileComplete,
    setIsMatchReady,
    setApprovalStatus,
    setIsAcceptingMentees,
  ]);

  if (isAuthLoading) {
    return <div className="p-8 text-center">Loading session...</div>;
  }

  const profileData = {
    currentJobTitle,
    bio,
    linkedinURL,
    scheduleURL,
    region,
    openToRemote,
    capacity,
    meetingCadence,
    meetingStructure,
    availability: [...selectedAvailability],
    disciplines: [...selectedDisciplines],
    skills: [...selectedSkills],
    industries: [...selectedIndustries],
  };

  const missingFields = checkEmptyFields(role, profileData);

  async function submitHandler(profileData: MentorProfilePayload) {
    if (missingFields.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Save profile and receive calculated flags in response
      const updatedProfile = await upsertMentorProfile(profileData);

      // Update context status flags immediately
      setIsProfileComplete(updatedProfile.isProfileComplete);
      setIsMatchReady(updatedProfile.isMatchReady);
      setApprovalStatus(updatedProfile.approvalStatus);
      setIsAcceptingMentees(updatedProfile.isAcceptingMentees);

      await refreshProfile();

      console.log("Profile saved successfully");
      // Next step: Notice CYF, waiting approval, Navigate to dashboard
      console.log("Saving profile:", profileData);
      navigate("/mentor/dashboard");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to save profile. Please try again."),
      );
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Header></Header>
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <PageTitle
          titleName="Your profile"
          titleDescription="Everything here feeds the matcher — the more you fill in, the better
            your match. Free-text fields are read by your future mentor, not by
            the algorithm."
        />

        <Notice missingFields={missingFields} />

        {errorMessage && (
          <div className="p-4 rounded bg-red-50 text-red-600 font-medium">
            {errorMessage}
          </div>
        )}

        <section className="space-y-4">
          <SectionHead sectionHead="About you" sectionDescription="" />
          <Card className="max-w-[738px] space-y-6">
            <FormField label="Job title / headline">
              <Input
                placeholder="e.g. Senior Engineer at …"
                value={currentJobTitle}
                onChange={(e) => setCurrentJobTitle(e.target.value)}
              />
            </FormField>

            <FormField label="Bio shown to matches">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </FormField>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="LinkedIn URL">
                <Input
                  placeholder="https://linkedin.com/in/…"
                  value={linkedinURL}
                  onChange={(e) => setLinkedinURL(e.target.value)}
                />
              </FormField>

              <FormField label="Scheduler link" optional="(optional)">
                <Input
                  placeholder="https://calendly.com/…"
                  value={scheduleURL || ""}
                  onChange={(e) => setScheduleURL(e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Region">
                <select
                  className="w-full rounded-md border border-line bg-surface px-4 py-2"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option key="" value="">
                    Please select your region
                  </option>
                  {regionOptions.map((region) => {
                    return (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    );
                  })}
                </select>
              </FormField>

              <div className="flex items-center gap-2 md:pt-6">
                <Switch
                  checked={openToRemote}
                  onCheckedChange={setOpenToRemote}
                />
                <label className="text-sm font-semibold">
                  Open to remote mentoring
                </label>
              </div>
            </div>
          </Card>
        </section>
        <section className="space-y-4">
          <SectionHead
            sectionHead="Availability"
            sectionDescription="Shared slots
            are scored by the matcher."
          />
          <OptionsDisplay
            options={availabilityOptions}
            selectedOptionsSet={selectedAvailability}
            onToggle={toggleAvailability}
          />
        </section>

        <section className="space-y-4">
          <SectionHead
            sectionHead="Your disciplines"
            sectionDescription="What you can mentor in — the core matching signal."
          />
          <OptionsDisplay
            options={goalOptions}
            selectedOptionsSet={selectedDisciplines}
            onToggle={toggleDisciplines}
          />
        </section>

        <section className="space-y-4">
          <SectionHead
            sectionHead="Capacity"
            sectionDescription="How many mentees you can take at once. You will never be proposed beyond it."
          />

          <Input
            className="max-w-[100px]"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </section>
        <section className="space-y-4">
          <SectionHead
            sectionHead="Compatibility questions"
            sectionDescription="Weighted questions influence who you are matched with; the rest give your match context."
          />

          <Card className="space-y-6 max-w-[738px]">
            <div className="space-y-2">
              <QuestionLabel question="What skills can you mentor?" />
              <OptionsDisplay
                options={mentorshipOptions}
                selectedOptionsSet={selectedSkills}
                onToggle={toggleSkills}
              />
            </div>

            <div className="space-y-2">
              <QuestionLabel question="What industry domain knowledge can you mentor?" />

              <OptionsDisplay
                options={industryOptions}
                selectedOptionsSet={selectedIndustries}
                onToggle={toggleIndustries}
              />
            </div>

            <div className="space-y-2">
              <QuestionLabel question="Meeting cadence" />
              <RadioGroup
                name="meeting-cadence"
                options={cadenceOptions}
                value={meetingCadence}
                onChange={setMeetingCadence}
              />
            </div>

            <div className="space-y-2">
              <QuestionLabel question="Preferred meeting style" />
              <RadioGroup
                name="meeting-style"
                options={mentoringStyleOptions}
                value={meetingStructure}
                onChange={setMeetingStructure}
              />
            </div>
          </Card>
        </section>
        <section className="max-w-[738px] space-y-6 pb-15">
          <div className="h-px bg-line" />

          <Button onClick={() => submitHandler(profileData)}>
            {isSubmitting ? "Saving..." : "Save profile"}
          </Button>
        </section>
      </main>
    </div>
  );
}
