import AppButton from "@/components/app/app-button";
import List from "@/components/app/list";
import { memo } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import IconBookmark from "@/components/app/icons/IconBookmark";
import { cn } from "@/lib/utils";
import { AppDropdownMenu, AppDropdownMenuTrigger, AppDropdownMenuContent, AppDropdownMenuItem } from "@/components/app/app-dropdown-menu";

type ToolbarButtonBookmarkProps = {
    title: string;
    categories: CommentCategory[];
    disabled: boolean;
    onSetBookmark?: () => void;
    onSelectCategory?: (category: CommentCategory) => void;
}

export const ToolbarButtonBookmark = memo(({
    title,
    categories,
    disabled,
    onSetBookmark,
    onSelectCategory,
}: ToolbarButtonBookmarkProps) => {
    return categories.length === 0 ? (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant="toolbar"
                size="icon"
                rounded="sm"
                onClick={onSetBookmark}
                disabled={disabled}>
                <IconBookmark />
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
                        <IconBookmark />
                    </AppButton>
                </ToolbarButtonTooltip>
            </AppDropdownMenuTrigger>
            <AppDropdownMenuContent className="w-40 max-h-[200px] overflow-y-auto">
                <List
                    data={categories}
                    renderItem={(item, index) => (
                        <AppDropdownMenuItem
                            key={index}
                            onClick={() => onSelectCategory?.(item)}>
                            <span>{item.name}</span>
                        </AppDropdownMenuItem>
                    )}
                />
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    )
})
