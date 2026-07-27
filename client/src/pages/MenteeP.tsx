import { useState } from "react";
import { Footer } from "../components/Footer";
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

export function MenteeProfile() {
  const [isRemote, setIsRemote] = useState(true);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    [],
  );
  const handleAvailabilityClick = (option: string) => {
  if (selectedAvailability.includes(option)) {
    setSelectedAvailability(
      selectedAvailability.filter(
        (item) => item !== option
      )
    );
  } else {
    setSelectedAvailability([
      ...selectedAvailability,
      option,
    ]);
  }
};


  // console.log(selectedAvailability);

  return (
    <div>
      <Header></Header>
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <section className="space-y-4">
          <h1 className="font-display text-4xl font-semibold">Your profile</h1>

          <p className="max-w-2xl text-muted">
            Everything here feeds the matcher — the more you fill in, the better
            your match. Free-text fields are read by your future mentor, not by
            the algorithm.
          </p>
        </section>

        <section>
          <h2>Where you are</h2>
          <Card className="max-w-[738px]">
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
        <Card className="max-w-[738px]">
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
        </Card>

        <section>Your goals</section>
        <section>Compatibility questions</section>
      </main>

      <Button>Save</Button>
      <Footer></Footer>
    </div>
  );
}
