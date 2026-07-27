import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { DisciplinesBand } from "../components/DisciplinesBand";
import { HeroBand } from "../components/ui/HeroBand";

export function Landing() {
  return (
    <div className="min-h-screen bg-bg text-fg p-8 space-y-12">
      <Header></Header>
      <HeroBand />
      <DisciplinesBand />
      <Footer></Footer>
    </div>
  );
}
