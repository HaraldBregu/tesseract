import AppButton from "@/components/app/app-button";
import { memo } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import { MessageCircle } from "lucide-react";

type ToolbarButtonChatProps = {
    title: string;
    disabled: boolean;
    onClick: () => void;
}

export const ToolbarButtonChat = memo(({
    title,
    disabled,
    onClick
}: ToolbarButtonChatProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant="toolbar"
                size="icon"
                rounded="sm"
                onClick={onClick}
                aria-label={title}
                aria-disabled={disabled}
                disabled={disabled}>
                <MessageCircle className="h-5 w-5" />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
