import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { DisciplinesBand } from "../components/DisciplinesBand";
import { HeroBand } from "../components/ui/HeroBand";
import { HowMatchingWorks } from "../components/ui/HowMatchingWorks";
import { VolunteerAnHour } from "../components/ui/VolunteerAnHour";

export function Landing() {
  return (
    <div className="min-h-screen bg-bg text-fg space-y-12">
      <Header></Header>
      <HeroBand />
      <HowMatchingWorks />
      <DisciplinesBand
        header={"Mentors across eleven disciplines"}
        smallerText={"Pick what you From your first CV review to cloud architecture — every mentor sets their own capacity, so nobody gets overbooked and nobody gets lost in a list. to grow in — this is what the matcher scores."}
        isSubmitButtonToRender={false}
      />
      <VolunteerAnHour />
      <Footer></Footer>
    </div>
  );
}