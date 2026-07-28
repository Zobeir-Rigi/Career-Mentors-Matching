import { useState } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/ui/Card";
import { Switch } from "../components/ui/Switch";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";

const availabilityOptions = [
  "Weekday morning",
  "Weekday afternoon",
  "Weekday evening",
  "Weekend morning",
  "Weekend afternoon",
  "Weekend evening",
];

const goalOptions = [
  "Software Engineering",
  "Data & Analytics",
  "Data Engineering",
  "DevOps, Cloud & Platform",
  "Cybersecurity",
  "QA & Testing",
  "Product & Project Managment",
  "Business Analysis",
  "UX & Design",
  "Career Development & Interview Prep",
  "Leadership & managment",
  "AI & Machine Learning",
];

const mentorshipOptions = [
  "Career advice",
  "Interview prep",
  "Technical growth",
  "Confidence",
];

const isMatchReady = false;

export function MenteeProfile() {
  const [isRemote, setIsRemote] = useState(true);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    [],
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedMentorshipOptions, setSelectedMentorshipOptions] = useState<
    string[]
  >([]);

  const [meetingCadence, setMeetingCadence] = useState("");
  const cadenceOptions = ["Weekly", "Fortnightly", "Monthly"];
  const [mentoringStyle, setMentoringStyle] = useState("");
  const mentoringStyleOptions = ["Structured", "Open", "Mix"];

  const handleAvailabilityClick = (option: string) => {
    if (selectedAvailability.includes(option)) {
      setSelectedAvailability(
        selectedAvailability.filter((item) => item !== option),
      );
    } else {
      setSelectedAvailability([...selectedAvailability, option]);
    }
  };

  // console.log(selectedAvailability);
  const handleGoalClick = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((item) => item !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleMentorshipOptionClick = (option: string) => {
    if (selectedMentorshipOptions.includes(option)) {
      setSelectedMentorshipOptions(
        selectedMentorshipOptions.filter((item) => item !== option),
      );
    } else {
      setSelectedMentorshipOptions([...selectedMentorshipOptions, option]);
    }
  };

  const handleMentoringStyleChange = (style: string) => {
    setMentoringStyle(style);
  };

  return (
    <div>
      <Header></Header>
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <section className="space-y-4">
          <h1 className="font-display text-4xl font-semibold overshoot">
            Your profile
          </h1>

          <p className="max-w-2xl text-muted">
            Everything here feeds the matcher — the more you fill in, the better
            your match. Free-text fields are read by your future mentor, not by
            the algorithm.
          </p>
        </section>
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

        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold overshoot ">
            Where you are
          </h2>
          <Card className="max-w-[738px] ">
            <div className=" space-y-2">
              <label className="text-sm font-semibold">Current job title</label>
              <input className="w-full rounded-md border border-line bg-surface px-4 py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                What do you want from mentorship?
              </label>
              <textarea className="w-full rounded-md border border-line bg-surface px-4 py-2" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">LinkedIn URL</label>
                <input className="w-full rounded-md border border-line bg-surface px-4 py-2" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Scheduler link</label>
                <input className="w-full rounded-md border border-line bg-surface px-4 py-2" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Region</label>
                <select className="w-full rounded-md border border-line bg-surface px-4 py-2">
                  <option>No region — remote only</option>
                </select>
              </div>

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
          <h2 className="font-display text-2xl font-semibold">
            <span className="overshoot">Availability</span>
          </h2>

          <p className="text-muted">
            What you want to grow in — the core matching signal.
          </p>
        </section>
        <div className="max-w-[738px]">
          <div className="flex flex-wrap gap-3">
            {availabilityOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                isSelected={selectedAvailability.includes(option)}
                onClick={() => handleAvailabilityClick(option)}
              />
            ))}
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">
            <span className="overshoot">Your goals</span>
          </h2>

          <p className="text-muted">
            What you want to grow in — the core matching signal.
          </p>

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
          <h2 className="font-display text-2xl font-semibold">
            <span className="overshoot">Compatibility questions</span>
          </h2>

          <p className="text-muted">
            These preferences help us make better matches and set expectations
            for the mentorship.
          </p>

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
                    isSelected={selectedMentorshipOptions.includes(option)}
                    onClick={() => handleMentorshipOptionClick(option)}
                  />
                ))}
              </div>
            </div>

            {/* Meeting cadence */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Meeting cadence</label>

              <div className="space-y-2">
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
              <label className="text-sm font-semibold">
                Anything your mentor should know about you?
              </label>

              <textarea
                className="w-full rounded-md border border-line bg-surface px-4 py-2"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Preferred mentoring style
              </label>

              <div className="space-y-2">
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
        <section className="max-w-[738px] space-y-6">
          <div className="h-px bg-line" />

          <Button>Save profile</Button>
        </section>
      </main>
    </div>
  );
}
