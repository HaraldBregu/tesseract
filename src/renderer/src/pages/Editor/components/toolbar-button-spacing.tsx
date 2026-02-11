import IconFormatLineSpacing from "@/components/app/icons/IconFormatLineSpacing";
import { memo } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import AppButton from "@/components/app/app-button";
import { AppDropdownMenu, AppDropdownMenuContent, AppDropdownMenuItem, AppDropdownMenuTrigger } from "@/components/app/app-dropdown-menu";
import { cn } from "@/lib/utils";

type ToolbarButtonSpacingProps = {
    title: string;
    disabled: boolean;
    tabIndex: number;
    list: SpacingList[];
    onShowCustomSpacing: () => void;
    customTitle: string;
    currentSpacing?: Spacing;
}

export const ToolbarButtonSpacing = memo(({
    title,
    disabled,
    tabIndex,
    list,
    onShowCustomSpacing,
    customTitle,
    currentSpacing
}: ToolbarButtonSpacingProps) => {

    const isActive = (value: string): boolean => {
        if (!currentSpacing) return false;

        // Parse before/after values (handle both string with units like '0px' and numbers)
        const beforeValue = typeof currentSpacing.before === 'string' 
            ? parseFloat(currentSpacing.before) 
            : (currentSpacing.before || 0);
        const afterValue = typeof currentSpacing.after === 'string' 
            ? parseFloat(currentSpacing.after) 
            : (currentSpacing.after || 0);

        const noMargins = beforeValue === 0 && afterValue === 0;
        if (!noMargins) return false;

        const currentLineValue = Number.parseFloat(currentSpacing.line.toString());
        const parsedValue = Number.parseFloat(value);

        return Math.abs(currentLineValue - parsedValue) < 0.001;
    };

    const isCustomSpacing = (): boolean => {
        if (!currentSpacing) return false;

        const standardValues = ['1', '1.15', '1.5', '2'];
        
        // Parse before/after values (handle both string with units like '0px' and numbers)
        const beforeValue = typeof currentSpacing.before === 'string' 
            ? parseFloat(currentSpacing.before) 
            : (currentSpacing.before || 0);
        const afterValue = typeof currentSpacing.after === 'string' 
            ? parseFloat(currentSpacing.after) 
            : (currentSpacing.after || 0);
        
        const hasCustomMargins = beforeValue > 0 || afterValue > 0;
        const currentLineStr = currentSpacing.line.toString();
        const isStandardLine = standardValues.includes(currentLineStr);

        return hasCustomMargins || !isStandardLine;
    };

    return (
        <AppDropdownMenu modal={false}>
            <ToolbarButtonTooltip tooltip={title} disabled={disabled}>
                <AppDropdownMenuTrigger asChild className={cn(
                    "leading-none",
                    // Text color
                    "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-10 dark:[&>svg]:hover:!bg-transparent",

                    // Background color
                    "disabled:!bg-transparent hover:!bg-grey-80 dark:disabled:!bg-transparent dark:hover:!bg-transparent"
                )} disabled={disabled}>
                    <AppButton
                        asChild
                        variant="toolbar"
                        size="icon"
                        rounded="sm"
                        tabIndex={tabIndex}
                        aria-label={title}
                        aria-disabled={disabled}
                        disabled={disabled}
                    >
                        <IconFormatLineSpacing />
                    </AppButton>
                </AppDropdownMenuTrigger>
            </ToolbarButtonTooltip>
            <AppDropdownMenuContent className="w-40">
                {
                    list.map((dt, index) => {
                        const active = isActive(dt.value);
                        return (
                            <AppDropdownMenuItem
                                tabIndex={tabIndex + index + 1}
                                key={dt.value}
                                onClick={dt.onClick}
                                className={cn(active && "bg-secondary-90 dark:bg-secondary-20")}
                            >
                                <span className="flex-1">{dt.label}</span>
                                {active && <span className="ml-2">✓</span>}
                            </AppDropdownMenuItem>
                        );
                    })
                }
                <AppDropdownMenuItem
                    onClick={onShowCustomSpacing}
                    tabIndex={tabIndex + list.length}
                    className={cn(isCustomSpacing() && "bg-secondary-90 dark:bg-secondary-20")}
                >
                    <span className="flex-1">{customTitle}</span>
                    {isCustomSpacing() && <span className="ml-2">✓</span>}
                </AppDropdownMenuItem>
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    );
});