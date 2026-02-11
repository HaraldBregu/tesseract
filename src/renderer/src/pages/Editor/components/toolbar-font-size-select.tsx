import AppSeparator from "@/components/app/app-separator";
import { Select, SelectValue } from "@/components/ui/select";
import { Fragment, memo, forwardRef } from "react";
import { AppSelectContent, AppSelectItem, AppSelectSeparator, AppSelectTrigger } from "@/components/app/app-select";
import List from "@/components/app/list";
import { cn } from "@/lib/utils";
import { ToolbarSelectTooltip } from "./toolbar-select-tooltip";


type ToolbarFontSizeSelectProps = {
    disabled: boolean;
    value: string | undefined;
    fontSizes: any[];
    onValueChange: (value: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tooltipLabel: string;
};

export const ToolbarFontSizeSelect = memo(forwardRef<HTMLDivElement, ToolbarFontSizeSelectProps>(({
    disabled,
    value,
    fontSizes,
    onValueChange,
    open,
    onOpenChange,
    tooltipLabel
}, ref) => {

    return (
        <div
            ref={ref}
            className="flex items-center space-x-2 transition-transform duration-300 h-full"
        >
            <AppSeparator orientation="vertical" className="max-h-[70%]" />
            <Select
                open={open}
                onOpenChange={onOpenChange}
                disabled={disabled}
                value={value}
                onValueChange={onValueChange}
            >
                <ToolbarSelectTooltip
                    tooltip={tooltipLabel}
                    className={cn()}
                    asChild
                >
                    <AppSelectTrigger className="py-0 border-none min-w-[45px]" aria-label="Font Size">
                        <SelectValue />
                    </AppSelectTrigger>
                </ToolbarSelectTooltip>
                <AppSelectContent>
                    <List
                        data={fontSizes}
                        renderItem={(size, index) => (
                            <Fragment key={`font-size-${index}`}>
                                {!index ? null : <AppSelectSeparator />}
                                {size && (
                                    <AppSelectItem value={size.toString()}>
                                        {size}
                                    </AppSelectItem>
                                )}
                            </Fragment>
                        )}
                    />
                </AppSelectContent>
            </Select>
        </div>
    );
}));