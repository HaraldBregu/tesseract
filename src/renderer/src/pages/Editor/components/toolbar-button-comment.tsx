import AppButton from "@/components/app/app-button";
import List from "@/components/app/list";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { memo } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import IconCommentAdd from "@/components/app/icons/IconCommentAdd";
import { cn } from "@/lib/utils";
import { AppDropdownMenu, AppDropdownMenuTrigger, AppDropdownMenuContent } from "@/components/app/app-dropdown-menu";

type ToolbarButtonCommentProps = {
    title: string;
    categories: CommentCategory[];
    disabled: boolean;
    onAddComment?: () => void;
    onSelectCategory?: (category: CommentCategory) => void;
}

export const ToolbarButtonComment = memo(({
    title,
    categories,
    disabled,
    onAddComment,
    onSelectCategory,
}: ToolbarButtonCommentProps) => {
    return categories.length === 0 ? (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant="toolbar"
                size="icon"
                rounded="sm"
                onClick={onAddComment}
                disabled={disabled}>
                <IconCommentAdd />
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
                        <IconCommentAdd />
                    </AppButton>
                </ToolbarButtonTooltip>
            </AppDropdownMenuTrigger>
            <AppDropdownMenuContent className="w-40 max-h-[200px] overflow-y-auto">
                <List
                    data={categories}
                    renderItem={(item, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={() => onSelectCategory?.(item)}>
                            <span>{item.name}</span>
                        </DropdownMenuItem>
                    )}
                />
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    )
})
