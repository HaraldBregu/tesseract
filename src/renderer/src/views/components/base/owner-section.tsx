import { Mail } from "lucide-react";
import { memo } from "react";

interface OwnerSectionProps {
    label: string;
    fullname: string;
    email: string;
}
const OwnerSection = memo(({
    label,
    fullname,
    email,
}: OwnerSectionProps) => {
    return (
        <div className="bg-blue-50 border border-blue-200 dark:bg-grey-20 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold text-foreground">{fullname}</p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{email}</span>
            </p>
        </div>
    );
});

export default OwnerSection