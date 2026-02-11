import AppButton from "@/components/app/app-button";
import List from "@/components/app/list";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { memo } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import { cn } from "@/lib/utils";
import IconHistoryEdu from "@/components/app/icons/IconHistoryEdu";
import { AppDropdownMenu, AppDropdownMenuContent, AppDropdownMenuTrigger } from "@/components/app/app-dropdown-menu";

type ToolbarButtonHistoryEduProps = {
    title: string;
    apparatuses: Apparatus[];
    disabled: boolean;
    onSetTextNoteToApparatus?: (apparatus: Apparatus) => void;
}

export const ToolbarButtonHistoryEdu = memo(({
    title,
    apparatuses,
    disabled,
    onSetTextNoteToApparatus,
}: ToolbarButtonHistoryEduProps) => {
    return apparatuses.length === 1 ? (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant={"toolbar"}
                size="icon"
                rounded="sm"
                onClick={() => onSetTextNoteToApparatus?.(apparatuses[0])}
                disabled={disabled}>
                <IconHistoryEdu />
            </AppButton>
        </ToolbarButtonTooltip>
    ) : (
        <AppDropdownMenu modal={false}>
            <AppDropdownMenuTrigger
                disabled={disabled}
                className={cn(
                    "leading-none",
                    // Text color
                    "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-10 dark:[&>svg]:hover:!bg-transparent",

                    // Background color
                    "disabled:!bg-transparent hover:!bg-transparent dark:disabled:!bg-transparent dark:hover:!bg-transparent",
                )}>
                <ToolbarButtonTooltip
                    tooltip={title}
                    disabled={disabled}>
                    <AppButton
                        asChild
                        variant="toolbar"
                        size="icon"
                        rounded="sm"
                        disabled={disabled}>
                        <IconHistoryEdu />
                    </AppButton>
                </ToolbarButtonTooltip>
            </AppDropdownMenuTrigger>
            <AppDropdownMenuContent className="w-40 max-h-[200px] overflow-y-auto">
                <List
                    data={apparatuses}
                    renderItem={(item, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={() => onSetTextNoteToApparatus?.(item)}>
                            <span>{item.title} ({item.type})</span>
                        </DropdownMenuItem>
                    )}
                />
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    )
})
