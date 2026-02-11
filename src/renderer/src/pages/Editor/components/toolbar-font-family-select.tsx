import AppSeparator from "@/components/app/app-separator";
import { Fragment, memo, forwardRef } from "react";
import { AppSelect, AppSelectContent, AppSelectItem, AppSelectSeparator, AppSelectTrigger, AppSelectValue } from "@/components/app/app-select";
import List from "@/components/app/list";
import { cn } from "@/lib/utils";
import { ToolbarSelectTooltip } from "./toolbar-select-tooltip";


type ToolbarFontFamilySelectProps = {
    disabled: boolean;
    value: string | undefined;
    fontFamilies: any[];
    onValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
    open: boolean;
    tooltipLabel: string;
};

export const ToolbarFontFamilySelect = memo(forwardRef<HTMLDivElement, ToolbarFontFamilySelectProps>(({
    disabled,
    value,
    fontFamilies,
    onValueChange,
    onOpenChange,
    open,
    tooltipLabel
}, ref) => {

    return (
        <div ref={ref} className="flex items-center space-x-2 h-full">
            <AppSeparator orientation="vertical" className="max-h-[70%]" />
            <AppSelect
                open={open}
                onOpenChange={onOpenChange}
                disabled={disabled}
                value={value}
                onValueChange={onValueChange}>
                <ToolbarSelectTooltip
                    tooltip={tooltipLabel}
                    className={cn()}
                    asChild>
                    <AppSelectTrigger
                        tabIndex={5}
                        aria-label="Font Family"
                        className="py-0 border-none min-w-[140px] leading-normal"
                        style={{ fontFamily: value }}>
                        <AppSelectValue />
                    </AppSelectTrigger>
                </ToolbarSelectTooltip>
                <AppSelectContent>
                    <List
                        data={fontFamilies}
                        renderItem={(type, index) => (
                            <Fragment
                                key={`font-family-${index}`}>
                                {!index ? null : <AppSelectSeparator />}
                                {type && <AppSelectItem
                                    style={{ fontFamily: type.value }}
                                    value={type?.value}>
                                    {type.value}
                                </AppSelectItem>}
                            </Fragment>
                        )}
                    />
                </AppSelectContent>
            </AppSelect>
        </div>
    );
}));