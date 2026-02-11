import { memo } from "react";
import criterionLogo from "@resources/appIcons/icon.png";

interface LogoSectionProps {
    title: string;
    description: string;
}
const LogoSection = memo(({
    title,
    description,
}: LogoSectionProps) => {
    return (
        <div className="flex flex-col items-center space-y-3">
            <div className="flex justify-center">
                <img
                    src={criterionLogo}
                    alt="Criterion Logo"
                    className="h-16 w-16 object-contain rounded-xl shadow-lg"
                />
            </div>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="font-medium text-primary">{description}</p>
            </div>
        </div>
    );
});

export default LogoSection