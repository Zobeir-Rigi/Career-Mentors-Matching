import { Thread } from "../Thread";
import { Button } from "../Button";

export function AfterMatchProposed({ onStepSubmit, currentStep, steps }: any) {
    const nextStep = steps[steps.indexOf(currentStep) + 1];
    let changeProgressBar = false;
    function matchStatus() {
        let content = null;
        switch (currentStep) {
            case "match-proposed":
                content = (
                    <div className="rounded-[20px] bg-tint w-[137px] text-left pl-3 p-1">
                        <p className="text-accent font-sans text-[12px]">Awaiting</p>
                        <p className="text-accent font-sans text-[12px]">acceptance</p>
                    </div>
                );
                changeProgressBar = true;
                break
            case "chemistry-and-confirm":
                changeProgressBar = true;
                content = (
                    <div className="rounded-[20px] bg-tint w-[137px] text-left pl-3 p-1">
                        <p className="text-warm font-sans text-[12px]">Chemistry &</p>
                        <p className="text-warm font-sans text-[12px]">confirm</p>
                    </div>
                );
                break
            case "mentorship-booked":
            case "mentor-confirm":
                changeProgressBar = false;
                content = (
                    <div className="rounded-[20px] bg-tint w-[137px] text-left pl-3 p-1">
                        <p className="text-warm font-sans text-[12px]">Chemistry &</p>
                        <p className="text-warm font-sans text-[12px]">confirm</p>
                    </div>
                );
                break
            case "mentorship-confirmed-waiting":
                changeProgressBar = true;
                content = (
                    <div className="rounded-[20px] bg-tint w-[137px] text-left pl-3 p-1">
                        <p className="text-warm font-sans text-[12px]">Chemistry &</p>
                        <p className="text-warm font-sans text-[12px]">confirm</p>
                    </div>
                );
                break
            case "mentorship-active":
                content = (
                    <div className="rounded-[20px] bg-ok-tint w-[137px] text-left pl-3 p-1">
                        <p className="text-ok font-sans text-[12px]">Active</p>
                    </div>
                )
                changeProgressBar = true;
        }
        return content;
    }
    function renderConfirmButton() {
        let buttonText = ''
        switch (currentStep) {
            case "match-proposed": buttonText = "Accept match"
                break
            case "chemistry-and-confirm": buttonText = "I've booked our session"
                break
            case "mentorship-booked":
            case "mentor-confirm":
            case "mentorship-confirmed-waiting": buttonText = "Confirm mentorship"
        }

        return (
            <Button onClick={() => onStepSubmit(nextStep, changeProgressBar)} className="bg-accent text-on-accent">
                {buttonText}
            </Button>
        );
    }
    function renderEmail() {
        let content = null;
        switch (currentStep) {
            case "chemistry-and-confirm": content = (
                <>
                    <p className="font-sans font-semibold text-muted text-[11px]">Reach Chidiebere</p>
                    <span className="font-sans text-[14px] underline text-accent mr-2">Email</span>
                    <span className="font-sans text-muted text-[14px] text-accent mr-2">No booking link — email them to arrange the session.</span>
                </>
            );
                break
            case "mentorship-booked":
            case "mentor-confirm":
            case "mentorship-confirmed-waiting":
            case "mentorship-active": content = (
                <>
                    <p className="font-sans font-semibold text-muted text-[11px]">Reach Chidiebere</p>
                    <span className="font-sans text-[14px] underline text-accent mr-2">Email</span>
                </>
            );
        }
        return content;
    }
    return (
        <div>
            <div className="w-full flex justify-center items-center">
                <div className="flex flex-row w-full">
                    <div className="w-[40%]">
                        <p className="font-display font-semibold text-[20px] text-right">You</p>
                        <p className="font-sans text-[12px] text-right">Bola Proposed</p>
                    </div>
                    <div className="w-[20%] flex flex-col justify-center items-center">
                        <Thread />
                        {matchStatus()}
                    </div>
                    <div className="w-[40%]">
                        <p className="font-display font-semibold text-[20px] text-left">Chidiebere Njoku</p>
                        <p className="font-sans text-[12px] text-left truncate">Data Science, Data Analytics, Career Development, CV, GitHub and LinkedIn Op…</p>
                    </div>
                </div>
            </div>
            {currentStep !== "match-proposed" ? <div className="w-full h-[1px] bg-gray-200 my-4" /> : null}
            {currentStep !== "match-proposed" ? renderEmail() : null}
            <div className="w-full h-[1px] bg-gray-200 my-4" />
            <div className="flex flex-row">
                <div className="w-[50%] text-left flex items-center">
                    <p className="text-muted text-[13px]">7 days left</p>
                    {currentStep === "mentorship-booked" && (
                        <p className="text-ok text-[13px] ml-3">Chemistry session booked</p>
                    )}
                </div>
                <div className="w-[50%] text-right">
                    {currentStep !== "mentorship-active" ? renderConfirmButton() : null}
                    <Button className="ml-2" variant="outline">Decline</Button>
                </div>
            </div>
        </div>
    );
}