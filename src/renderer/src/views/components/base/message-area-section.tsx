import AppLabel from "@/components/app/app-label";
import { Textarea } from "@/components/ui/textarea";

interface MessageAreaSectionProps {
    title: string;
    placeholder: string;
    value: string;
    onMessageChange: (message: string) => void;
    disabled: boolean;
}

const MessageAreaSection = ({
    title,
    placeholder,
    value,
    onMessageChange,
    disabled,
}: MessageAreaSectionProps) => {
    return (
        <div className="space-y-2">
            <AppLabel htmlFor="message" className="text-sm">
                {title} <span className="text-destructive">*</span>
            </AppLabel>
            <Textarea
                id="message"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onMessageChange(e.target.value)}
                className="min-h-[80px] resize-none text-sm"
                disabled={disabled}
                maxLength={255}
            />
            <p className="text-xs text-muted-foreground text-right">
                {value.length}/255
            </p>
        </div>
    );
};

export default MessageAreaSection