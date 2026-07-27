// import { Chip } from './ui/Chip'

const disciplines: string[] = [
  "Software Engineering",
  "Data & Analytics",
  "Data Engineering",
  "DevOps, Cloud & Platform",
  "Cybersecurity",
  "QA & Testing",
  "Product & Project Management",
  "Business Analysis",
  "UX & Design",
  "Career Development & Interview Prep",
  "Leadership & Management",
];

export const DisciplinesBand = () => {
  return (
    <section
      aria-labelledby="disciplines-heading"
      className="bg-bg px-5 py-16 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-277.5">
        <h2 id="disciplines-heading" className="overshoot font-display text-fg">
          Mentors across eleven disciplines
        </h2>
        <p>
          From your first CV review to cloud architecture — every mentor sets
          their own capacity, so nobody gets overbooked and nobody gets lost in
          a list.
        </p>
        <div>
          {disciplines.map((discipline) => (
            <p key={discipline}> {discipline}</p>
          ))}
        </div>
      </div>
    </section>
  );
};
