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

import { useProfile } from "../lib/context/ProfileContext";
import { QuestionLabel } from "../components/ui/QuestionLabel";
import { Notice } from "../components/ui/Notice";
import { checkEmptyFields } from "@/lib/profileValidation";
import { RadioGroup } from "@/components/ui/RadioGroup";

export function MentorProfile() {
  const {
    role,
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

  const missingFields = checkEmptyFields(role, profileData);

  function submitHandler() {
    if (missingFields.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Next step: Navigate to dashboard
    console.log("Saving profile:", profileData);
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

              <FormField label="Scheduler link" optional="(optional)">
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

          <Button onClick={() => submitHandler()}>Save profile</Button>
        </section>
      </main>
    </div>
  );
}
