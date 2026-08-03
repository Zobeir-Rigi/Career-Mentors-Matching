import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { MentorshipStages } from "../components/ui/MentorshipStages";
import { DisciplinesBand } from "../components/DisciplinesBand";
import { PastMatches } from "../components/ui/MentorshipStages/PastMatches"

export function MenteeDashboard() {
    return (
        <div className="min-h-screen bg-bg text-fg p-8 space-y-12">
            <Header></Header>
            <MentorshipStages />
            <DisciplinesBand
                header={"Your goals"}
                smallerText={"Pick what you want to grow in — this is what the matcher scores."}
                isSubmitButtonToRender={true}
            />
            <PastMatches />
            <Footer></Footer>
        </div >
    );
}