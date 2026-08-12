import {
  getMenteeProfile,
  updateMenteeProfile,
} from "../services/menteeProfileService";

import { useEffect } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/ui/Card";
import { Switch } from "../components/ui/Switch";
import { Button } from "../components/ui/Button";
import { PageTitle } from "../components/ui/PageTitle";
import { SectionHead } from "@/components/ui/SectionHead";
import { Notice } from "@/components/ui/Notice";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Textarea } from "../components/ui/Textarea";
import { QuestionLabel } from "../components/ui/QuestionLabel";
import { OptionsDisplay } from "../components/ui/OptionsDisplay";

import { checkEmptyFields } from "@/lib/profileValidation";
import {
  availabilityOptions,
  industryOptions,
  goalOptions,
  mentorshipOptions,
  cadenceOptions,
  mentoringStyleOptions,
  regionOptions,
} from "../lib/ProfileOptions";

import { useProfile } from "../lib/context/ProfileContext";
import type { MenteeProfileContextType } from "../lib/context/ProfileContext";

export function MenteeProfile() {
  const {
    role,
    currentJobTitle,
    setCurrentJobTitle,
    reasonNote,
    setReasonNote,
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
  } = useProfile() as MenteeProfileContextType;

  useEffect(() => {
    getMenteeProfile()
      .then((data) => {
        setCurrentJobTitle(data.currentJobTitle ?? "");
        setReasonNote(data.reasonsNote ?? "");
        setBio(data.bio ?? "");
        setLinkedinURL(data.linkedinURL ?? "");
        setScheduleURL(data.scheduleURL ?? "");
        setRegion(data.region ?? "");
        setOpenToRemote(data.openToRemote ?? false);
        setMeetingCadence(data.meetingCadence ?? "");
        setMeetingStructure(data.meetingStructure ?? "");

        if (data.availability) {
          setAvailability(data.availability);
        }

        if (data.disciplineGoals) {
          setDisciplines(data.disciplineGoals);
        }

        if (data.wantedSkills) {
          setSkills(data.wantedSkills);
        }

        if (data.industries) {
          setIndustries(data.industries);
        }
      })
      .catch((error) => {
        console.error("❌ API ERROR:", error);
      });
  }, []);

  const profileData = {
    currentJobTitle,
    reasonNote,
    bio,
    linkedinURL,
    scheduleURL,
    region,
    openToRemote,
    meetingCadence,
    meetingStructure,
    availability: [...selectedAvailability],
    disciplines: [...selectedDisciplines],
    skills: [...selectedSkills],
    industries: [...selectedIndustries],
  };

  const missingFields = checkEmptyFields(role, profileData);

  async function submitHandler() {
    console.log("BUTTON CLICKED");
    console.log("Missing fields:", missingFields);
    console.log({
      availability: Array.from(selectedAvailability),
      meetingCadence,
      meetingStructure,
    });
    console.log({
      reasonsNote: reasonNote,
    });

    try {
      const response = await updateMenteeProfile({
        currentJobTitle: currentJobTitle,
        reasonsNote: reasonNote,
        bio,
        linkedinURL: linkedinURL,
        scheduleURL: scheduleURL,
        region,
        openToRemote,
        availability: Array.from(selectedAvailability),
        disciplineGoals: Array.from(selectedDisciplines),
        wantedSkills: Array.from(selectedSkills),
        industries: Array.from(selectedIndustries),

        meetingCadence,
        meetingStructure,
      });

      console.log("✅ Profile saved", response);
    } catch (error: any) {
      console.error("❌ Failed to save profile");
      console.error(error.response?.data);
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
        {/* Warning banner */}
        <Notice missingFields={missingFields} />

        <section className="space-y-6">
          <SectionHead sectionHead="Where you are" sectionDescription="" />

          <Card className="max-w-[738px] space-y-6">
            <FormField label="Current job title" optional="(optional)">
              <Input
                placeholder="e.g. Care worker …"
                value={currentJobTitle}
                onChange={(e) => setCurrentJobTitle(e.target.value)}
              />
            </FormField>

            <FormField label="Tell us what you're hoping to achieve through mentorship">
              <Textarea
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
              />
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
                  value={scheduleURL}
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
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
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
            sectionHead="Your goals"
            sectionDescription="What you want to grow in — the core matching signal."
          />

          <OptionsDisplay
            options={goalOptions}
            selectedOptionsSet={selectedDisciplines}
            onToggle={toggleDisciplines}
          />
        </section>

        <section className="space-y-4">
          <SectionHead
            sectionHead="Compatibility questions"
            sectionDescription=" These preferences help us make better matches and set expectations
            for the mentorship."
          />

          <Card className="space-y-6 max-w-[738px]">
            {/* What do you most want from mentorship? */}
            <div className="space-y-2">
              <QuestionLabel question="What do you most want from mentorship?" />
              <OptionsDisplay
                options={mentorshipOptions}
                selectedOptionsSet={selectedSkills}
                onToggle={toggleSkills}
              />
            </div>

            <div className="space-y-2">
              <QuestionLabel question="Which industries are you most interested in?" />

              <OptionsDisplay
                options={industryOptions}
                selectedOptionsSet={selectedIndustries}
                onToggle={toggleIndustries}
              />
            </div>

            {/* Meeting cadence */}
            <div className="space-y-2">
              <QuestionLabel question="Meeting cadence" />
              <RadioGroup
                name="meeting-cadence"
                options={cadenceOptions}
                value={meetingCadence}
                onChange={setMeetingCadence}
              />
            </div>
            <FormField label="Anything your mentor should know about you?">
              <Textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </FormField>
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

          <Button onClick={submitHandler}>Save profile</Button>
        </section>
      </main>
    </div>
  );
}
