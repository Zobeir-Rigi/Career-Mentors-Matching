

interface StageTrackerProps {
    circleStyles: Record<number, string>;
    progressTextStyles: Record<number, string>;
    progressLinesStyles: Record<number, string>;
}

export const StageTracker: React.FC<StageTrackerProps> = ({ circleStyles, progressTextStyles, progressLinesStyles }) => {
    return (
        <div className="container max-w-[1152px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-center justify-between gap-y-6 lg:gap-y-0 mb-8">
            <div className="flex flex-row justify-between items-center w-full lg:w-auto">
                <div className="flex flex-row items-center">
                    <p className={`rounded-[13px] w-[13px] h-[13px] border ${circleStyles[1]} p-0 mr-2`}></p>
                    <p className={`font-display ${progressTextStyles[1]} text-[14px]`}>Goals & availability</p>
                </div>
                <div className={`ml-8 hidden lg:block w-[104px] border-t ${progressLinesStyles[1]} ml-2`}></div>
            </div>
            <div className="flex flex-row justify-between items-center w-full lg:w-auto">
                <div className="flex flex-row items-center">
                    <p className={`rounded-[13px] w-[13px] h-[13px] border ${circleStyles[2]} p-0 mr-2`}></p>
                    <p className={`font-display ${progressTextStyles[2]} text-[14px]`}>Match proposed</p>
                </div>
                <div className={`ml-8 hidden lg:block w-[104px] border-t ${progressLinesStyles[2]} ml-2`}></div>
            </div>
            <div className="flex flex-row justify-between items-center w-full lg:w-auto">
                <div className="flex flex-row items-center">
                    <p className={`rounded-[13px] w-[13px] h-[13px] border ${circleStyles[3]} p-0 mr-2`}></p>
                    <p className={`font-display ${progressTextStyles[3]} text-[14px]`}>Chemistry & confirm</p>
                </div>
                <div className={`ml-8 hidden lg:block w-[104px] border-t ${progressLinesStyles[3]} ml-2`}></div>
            </div>
            <div className="flex flex-row items-center">
                <p className={`rounded-[13px] w-[13px] h-[13px] border ${circleStyles[4]} p-0 mr-2`}></p>
                <p className={`font-display ${progressTextStyles[4]} text-[14px]`}>Mentorship active</p>
            </div>
        </div>
    );
}