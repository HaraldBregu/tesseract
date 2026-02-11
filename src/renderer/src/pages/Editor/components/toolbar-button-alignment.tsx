import { memo, useCallback } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import IconAlignLeft from "@/components/app/icons/IconAlignLeft";
import IconAlignCenter from "@/components/app/icons/IconAlignCenter";
import IconAlignRight from "@/components/app/icons/IconAlignRight";
import IconAlignJustify from "@/components/app/icons/IconAlignJustify";
import AppButton from "@/components/app/app-button";
import { cn } from "@/lib/utils";
import { AppDropdownMenu, AppDropdownMenuContent, AppDropdownMenuItem, AppDropdownMenuTrigger } from "@/components/app/app-dropdown-menu";

type ToolbarButtonAlignmentProps = {
    title: string;
    titleLeft: string;
    titleRight: string;
    titleCenter: string;
    titleJustify: string;
    alignment: string;
    tabIndex: number;
    disabled: boolean;
    handleAlignmentChange: (alignment: Alignment) => void
}

export const ToolbarButtonAlignment = memo(({
    alignment,
    handleAlignmentChange,
    title,
    titleCenter,
    titleJustify,
    titleLeft,
    titleRight,
    disabled,
    tabIndex
}: ToolbarButtonAlignmentProps) => {
    const onClickLeft = useCallback(() => {
        handleAlignmentChange('left');
    }, [handleAlignmentChange]);

    const onClickRight = useCallback(() => {
        handleAlignmentChange('right');
    }, [handleAlignmentChange]);

    const onClickCenter = useCallback(() => {
        handleAlignmentChange('center');
    }, [handleAlignmentChange]);

    const onClickJustify = useCallback(() => {
        handleAlignmentChange('justify');
    }, [handleAlignmentChange]);

    return (
        <AppDropdownMenu modal={false}>
            <ToolbarButtonTooltip tooltip={title} disabled={disabled}>
                <AppDropdownMenuTrigger disabled={disabled} className={cn(
                    "leading-none",
                    // Text color
                    "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-10 dark:[&>svg]:hover:!bg-transparent",

                    // Background color
                    "disabled:!bg-transparent hover:!bg-grey-80 dark:disabled:!bg-transparent dark:hover:!bg-transparent"
                )} asChild>
                    <AppButton
                        asChild
                        variant='toolbar'
                        aria-label={title}
                        size="icon"
                        rounded="sm"
                        tabIndex={tabIndex}
                        aria-disabled={disabled}
                        disabled={disabled}>
                        {
                            alignment === "left" ? <IconAlignLeft /> :
                                alignment === "center" ? <IconAlignCenter /> :
                                    alignment === "right" ? <IconAlignRight /> :
                                        <IconAlignJustify />
                        }
                    </AppButton>
                </AppDropdownMenuTrigger>
            </ToolbarButtonTooltip>

            <AppDropdownMenuContent data-orientation='horizontal' className="flex space-x-2 p-1">
                <AppDropdownMenuItem className="p-0" onClick={onClickLeft}>
                    <ToolbarButtonTooltip tooltip={titleLeft} >
                        <AppButton
                            variant={alignment === 'left' ? 'toolbar-selected' : 'toolbar'}
                            aria-label={titleLeft}
                            size="icon"
                            rounded="sm"
                            tabIndex={tabIndex + 1}
                            aria-disabled={disabled}
                            disabled={disabled}
                        >
                            <IconAlignLeft />
                        </AppButton>
                    </ToolbarButtonTooltip>
                </AppDropdownMenuItem>
                <AppDropdownMenuItem className="p-0" onClick={onClickCenter}>
                    <ToolbarButtonTooltip tooltip={titleCenter} >
                        <AppButton
                            variant={alignment === 'center' ? 'toolbar-selected' : 'toolbar'}
                            aria-label={titleCenter}
                            size="icon"
                            rounded="sm"
                            tabIndex={tabIndex + 2}
                            aria-disabled={disabled}
                            disabled={disabled}
                        >
                            <IconAlignCenter />
                        </AppButton>
                    </ToolbarButtonTooltip>
                </AppDropdownMenuItem>
                <AppDropdownMenuItem className="p-0" onClick={onClickRight}>
                    <ToolbarButtonTooltip tooltip={titleRight} >
                        <AppButton
                            variant={alignment === 'right' ? 'toolbar-selected' : 'toolbar'}
                            aria-label={titleRight}
                            size="icon"
                            rounded="sm"
                            tabIndex={tabIndex + 3}
                            aria-disabled={disabled}
                            disabled={disabled}
                        >
                            <IconAlignRight />
                        </AppButton>
                    </ToolbarButtonTooltip>
                </AppDropdownMenuItem>
                <AppDropdownMenuItem className="p-0" onClick={onClickJustify}>
                    <ToolbarButtonTooltip tooltip={titleJustify} >
                        <AppButton
                            variant={alignment === 'justify' ? 'toolbar-selected' : 'toolbar'}
                            aria-label={titleJustify}
                            size="icon"
                            rounded="sm"
                            tabIndex={tabIndex + 4}
                            aria-disabled={disabled}
                            disabled={disabled}
                        >
                            <IconAlignJustify />
                        </AppButton>
                    </ToolbarButtonTooltip>
                </AppDropdownMenuItem>
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    )
});