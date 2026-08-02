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
} from "../ProfileOptions";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Textarea } from "../components/ui/Textarea";
import { PageTitle } from "../components/ui/PageTitle";
import { SectionHead } from "../components/ui/SectionHead";
import { OptionsDisplay } from "../components/ui/OptionsDisplay";

import { useProfile } from "../lib/context/MentorProfileContext";
import { QuestionLabel } from "../components/ui/QuestionLabel";
import { Notice } from "../components/ui/Notice";

export function MentorProfile() {
  const {
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
  } = useProfile();

  const FIELD_LABELS: Record<string, string> = {
    jobTitle: "Job title",
    bio: "Bio",
    linkedInUrl: "LinkedIn URL",
    scheduleUrl: "Scheduler link",
    region: "Region",
    capacity: "Capacity",
    meetingCadence: "Meeting cadence",
    meetingStructure: "Preferred meeting style",
    availability: "Availability",
    disciplines: "Disciplines",
    skills: "Skills",
    industries: "Industries",
  };

  const profileData = {
    jobTitle,
    bio,
    linkedInUrl,
    scheduleUrl,
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

  function checkEmptyFields(profileData: object) {
    return Object.entries(profileData).reduce((acc, [key, value]) => {
      if (typeof value === "string") {
        if (value.trim() === "") {
          acc.push(FIELD_LABELS[key] || key);
        }
      } else if (typeof value === "number") {
        if (value <= 0) {
          acc.push(FIELD_LABELS[key] || key);
        }
      } else if (Array.isArray(value)) {
        if (value.length == 0) {
          acc.push(FIELD_LABELS[key] || key);
        }
      }
      return acc;
    }, [] as string[]);
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
        <Notice missingFields={checkEmptyFields(profileData)} />

        <section className="space-y-4">
          <SectionHead sectionHead="About you" sectionDescription="" />
          <Card className="max-w-[738px] space-y-6">
            <FormField label="Job title / headline">
              <Input
                placeholder="e.g. Senior Engineer at …"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </FormField>

            <FormField label="Bio shown to matches">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </FormField>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="LinkedIn URL">
                <Input
                  placeholder="https://linkedin.com/in/…"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                />
              </FormField>

              <FormField label="Scheduler link">
                <Input
                  placeholder="https://calendly.com/…"
                  value={scheduleUrl}
                  onChange={(e) => setScheduleUrl(e.target.value)}
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

              <FormField label="">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={openToRemote}
                    onCheckedChange={setOpenToRemote}
                  />
                  <label className="text-sm font-semibold">
                    Open to remote mentoring
                  </label>
                </div>
              </FormField>
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
              <QuestionLabel question="What industries domain knowledge can you mentor?" />

              <OptionsDisplay
                options={industryOptions}
                selectedOptionsSet={selectedIndustries}
                onToggle={toggleIndustries}
              />
            </div>

            {/* Meeting cadence */}
            <div className="space-y-2">
              <QuestionLabel question="Meeting cadence" />

              <div className="flex flex-wrap gap-6">
                {cadenceOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="meeting-cadence"
                      value={option}
                      checked={meetingCadence === option}
                      onChange={() => setMeetingCadence(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <QuestionLabel question="Preferred meeting style" />
              <div className="flex flex-wrap gap-6">
                {mentoringStyleOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mentoring-style"
                      value={option}
                      checked={meetingStructure === option}
                      onChange={() => setMeetingStructure(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </section>
        <section className="max-w-[738px] space-y-6 pb-15">
          <div className="h-px bg-line" />

          <Button
            onClick={() =>
              checkEmptyFields(profileData).length == 0 &&
              console.log(profileData)
            }
          >
            Save profile
          </Button>
        </section>
      </main>
    </div>
  );
}
