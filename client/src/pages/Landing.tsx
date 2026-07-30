import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { DisciplinesBand } from "../components/DisciplinesBand";
import { HeroBand } from "../components/HeroBand";
import { HowMatchingWorks } from "../components/HowMatchingWorks";
import { VolunteerAnHour } from "../components/VolunteerAnHour";

export function Landing() {
  return (
    <div className="min-h-screen bg-bg text-fg space-y-12">
      <Header></Header>
      <HeroBand />
      <HowMatchingWorks />
      <DisciplinesBand />
      <VolunteerAnHour />
      <Footer></Footer>
    </div>
  );
}
