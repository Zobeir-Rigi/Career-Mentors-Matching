import { Thread } from "../Thread";
import { Button } from "../Button";
import { useNavigate } from "react-router";

interface GoalsAndAvailability {
    isProfileComplete: boolean;
    onStepSubmit: (viewToRender: string, changeProgressBar?: boolean) => void;
    currentStep?: string;
};

export function GoalsAndAvailability({ isProfileComplete, onStepSubmit }: GoalsAndAvailability) {
    const navigate = useNavigate();
    function checkProfile() {
        if (isProfileComplete) {
            onStepSubmit("match-proposed");
        } else {
            navigate("/mentee/profile");
        }
    }
    return (
        <div>
            <div className="w-full h-8 mb-4 flex justify-center items-center">
                <Thread />
            </div>
            <p className="font-display font-semibold text-[22px] text-center">
                One dot is you. Let's find the other one.
            </p>
            <p className="font-sans text-[16px] text-muted text-center">
                {isProfileComplete ? "You are all set — ask for a match and we will propose the best available mentor." : (
                    <>
                        Add your availability <span className="underline text-accent">in your profile</span> — the matcher only
                    </>
                )}
            </p>

            <p className="font-sans text-[16px] text-muted text-center mb-4">
                proposes mentors whose time can work with yours.
            </p>
            <div className="container text-center">
                <Button onClick={() => checkProfile()} className="bg-accent text-on-accent">Find me a mentor</Button>
            </div>
        </div>
    );
}