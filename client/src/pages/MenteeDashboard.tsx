import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { MentorshipStages } from "../components/ui/MentorshipStages";
import { DisciplinesBand } from "../components/DisciplinesBand";

export function MenteeDashboard() {
    return (
        <div className="min-h-screen bg-bg text-fg p-8 space-y-12">
            <Header></Header>
            <MentorshipStages />
            <Footer></Footer>
        </div >
    );
}