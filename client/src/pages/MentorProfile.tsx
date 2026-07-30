import { useState } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/ui/Card";
import { Switch } from "../components/ui/Switch";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import {
  availabilityOptions,
  goalOptions,
  mentorshipOptions,
  cadenceOptions,
  mentoringStyleOptions,
} from "../ProfileOptions";
import { Input } from "../components/ui/Input";
import { FormField } from "../components/ui/FormField";
import { Textarea } from "../components/ui/Textarea";
import { PageTitle } from "../components/ui/PageTitle";
import { SectionHead } from "../components/ui/SectionHead";
import { OptionsDisplay } from "../components/ui/OptionsDisplay";

export function MentorProfile() {
  const isMatchReady = false;
  const [isRemote, setIsRemote] = useState(true);
  const [selectedAvailability, setSelectedAvailability] = useState<Set<string>>(
    new Set(),
  );
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [selectedSkillOptions, setSelectedSkillOptions] = useState<Set<string>>(
    new Set(),
  );

  const [meetingCadence, setMeetingCadence] = useState("");
  const [mentoringStyle, setMentoringStyle] = useState("");

  const handleAvailabilityClick = (option: string) => {
    if (selectedAvailability.includes(option)) {
      setSelectedAvailability(
        selectedAvailability.filter((item) => item !== option),
      );
    } else {
      setSelectedAvailability([...selectedAvailability, option]);
    }
  };

  const handleGoalClick = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((item) => item !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSkillOptionsClick = (option: string) => {
    if (selectedSkillOptions.includes(option)) {
      setSelectedSkillOptions(
        selectedSkillOptions.filter((item) => item !== option),
      );
    } else {
      setSelectedSkillOptions([...selectedSkillOptions, option]);
    }
  };

  const handleMentoringStyleChange = (style: string) => {
    setMentoringStyle(style);
  };

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

              <Input placeholder="e.g. Care worker" />
            </div>

            <FormField label="What do you want from mentorship?">
              <Textarea />
            </FormField>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="LinkedIn URL">
                <Input placeholder="https://linkedin.com/in/…" />
              </FormField>

              <FormField label="Scheduler link">
                <Input placeholder="https://calendly.com/…" />
              </FormField>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Region">
                <select className="w-full rounded-md border border-line bg-surface px-4 py-2">
                  <option>No region — remote only</option>
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
          <OptionsDisplay options={availabilityOptions} selectedOptionsSet={selectedAvailability} onToggle={(option) => setSelectedAvailability(prevSet) => optionsSetHandler(selectedAvailability, option)} />
        </section>

        <section className="space-y-4">
          <SectionHead
            sectionHead="Your disciplines"
            sectionDescription="What you can mentor in — the core matching signal."
          />

          <div className="max-w-[738px]">
            <div className="flex flex-wrap gap-3">
              {goalOptions.map((goal) => (
                <Chip
                  key={goal}
                  label={goal}
                  isSelected={selectedGoals.includes(goal)}
                  onClick={() => handleGoalClick(goal)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHead
            sectionHead="Capacity"
            sectionDescription="How many mentees you can take at once. You will never be proposed beyond it."
          />
        </section>
        <section className="space-y-4">
          <SectionHead
            sectionHead="Compatibility questions"
            sectionDescription="Weighted questions influence who you are matched with; the rest give your match context."
          />

          <Card className="space-y-6 max-w-[738px]">
            {/* What do you most want from mentorship? */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                What do you most want from mentorship?
              </label>

              <div className="flex flex-wrap gap-3">
                {mentorshipOptions.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    isSelected={selectedSkillOptions.includes(option)}
                    onClick={() => handleSkillOptionsClick(option)}
                  />
                ))}
              </div>
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
                Preferred mentoring style
              </label>
              <div className="flex flex-wrap gap-6 pt-4">
                {mentoringStyleOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mentoring-style"
                      value={option}
                      checked={mentoringStyle === option}
                      onChange={() => handleMentoringStyleChange(option)}
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
