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
} from "../ProfileOptions";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Textarea } from "../components/ui/Textarea";
import { PageTitle } from "../components/ui/PageTitle";
import { SectionHead } from "../components/ui/SectionHead";
import { OptionsDisplay } from "../components/ui/OptionsDisplay";

import { useProfile } from "../lib/context/MentorProfileContext";
import { QuestionLabel } from "../components/ui/QuestionLabel";

export function MentorProfile() {
  const isMatchReady = false;

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
    isRemote,
    setIsRemote,
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
        {!isMatchReady && (
          <section className="max-w-[708px]">
            <div className="rounded-md bg-warn-tint px-4 py-3 text-sm text-fg">
              <span className="font-semibold">You can't be matched yet.</span>

              <span className="ml-4">
                Still needed: your availability — set it below and save.
              </span>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <SectionHead sectionHead="About you" sectionDescription="" />
          <Card className="max-w-[738px] space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">
                  Current job title
                </label>

                <span className="text-sm text-muted">(Optional)</span>
              </div>

              <Input
                placeholder="e.g. Care worker"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

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
                  <option value="OTHER">No region — remote only</option>
                  <option value="LONDON">London</option>
                  <option value="WEST_MIDLANDS">West Midland</option>
                </select>
              </FormField>

              <div className="flex items-center gap-2">
                <Switch checked={isRemote} onCheckedChange={setIsRemote} />
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
              <label className="text-sm font-semibold">
                What skills can you mentor?
              </label>
              <OptionsDisplay
                options={mentorshipOptions}
                selectedOptionsSet={selectedSkills}
                onToggle={toggleSkills}
              />
            </div>

            <div className="space-y-2">
              {/* <label className="text-sm font-semibold">
                What industries domain knowledge can you mentor?
              </label> */}

              <QuestionLabel question="What industries domain knowledge can you mentor?" />

              <OptionsDisplay
                options={industryOptions}
                selectedOptionsSet={selectedIndustries}
                onToggle={toggleIndustries}
              />
            </div>

            {/* Meeting cadence */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Meeting cadence</label>

              <div className="flex flex-wrap gap-6 pt-4">
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
            <FormField label="Anything your mentor should know about you?">
              <Textarea rows={4} />
            </FormField>
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Preferred meeting style
              </label>
              <div className="flex flex-wrap gap-6 pt-4">
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

          <Button>Save profile</Button>
        </section>
      </main>
    </div>
  );
}
