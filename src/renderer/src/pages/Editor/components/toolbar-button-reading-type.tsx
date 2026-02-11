import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconReadingType from "@/components/app/icons/IconReadingType";
import { AppDropdownMenu, AppDropdownMenuContent, AppDropdownMenuItem, AppDropdownMenuTrigger } from "@/components/app/app-dropdown-menu";
import { cn } from "@/lib/utils";


type ToolbarButtonReadingTypeProps = {
    title: string;
    disabled: boolean;
    readingTypeAdd: ReadingTypeAdd;
    readingTypeOm: ReadingTypeOm;
    readingTypeTr: ReadingTypeTr;
    readingTypeDel: ReadingTypeDel;
    onClickReadingTypeAdd: (readingType: ReadingTypeAdd) => void;
    onClickReadingTypeOm: (readingType: ReadingTypeOm) => void;
    onClickReadingTypeTr: (readingType: ReadingTypeTr) => void;
    onClickReadingTypeDel: (readingType: ReadingTypeDel) => void;
}

export const ToolbarButtonReadingType = memo(({
    title,
    disabled,
    readingTypeAdd,
    readingTypeOm,
    readingTypeTr,
    readingTypeDel,
    onClickReadingTypeAdd,
    onClickReadingTypeOm,
    onClickReadingTypeTr,
    onClickReadingTypeDel,
}: ToolbarButtonReadingTypeProps) => {

    return (
        <AppDropdownMenu modal={false}>
            <AppDropdownMenuTrigger disabled={disabled}
                className={cn(
                    "leading-none",
                    // Text color
                    "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-50 dark:[&>svg]:hover:!bg-transparent",

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
                        <IconReadingType />
                    </AppButton>
                </ToolbarButtonTooltip>
            </AppDropdownMenuTrigger>
            <AppDropdownMenuContent className="w-40 max-h-[200px] max-w-[30px] overflow-y-auto">
                <AppDropdownMenuItem
                    onClick={() => onClickReadingTypeAdd(readingTypeAdd)}>
                    <span>{readingTypeAdd.content} (add.)</span>
                </AppDropdownMenuItem>
                <AppDropdownMenuItem
                    onClick={() => onClickReadingTypeOm(readingTypeOm)}>
                    <span>{readingTypeOm.content} (om.)</span>
                </AppDropdownMenuItem>
                <AppDropdownMenuItem
                    onClick={() => onClickReadingTypeTr(readingTypeTr)}>
                    <span>{readingTypeTr.content} (tr.)</span>
                </AppDropdownMenuItem>
                <AppDropdownMenuItem
                    onClick={() => onClickReadingTypeDel(readingTypeDel)}>
                    <span>{readingTypeDel.content} (del.)</span>
                </AppDropdownMenuItem>
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    )
})
