import AppSeparator from "@/components/app/app-separator";
import { Fragment, memo, forwardRef, useCallback } from "react";
import { AppSelect, AppSelectContent, AppSelectItem, AppSelectSeparator, AppSelectTrigger, AppSelectValue } from "@/components/app/app-select";
import List from "@/components/app/list";
import { cn } from "@/lib/utils";
import { ToolbarSelectTooltip } from "./toolbar-select-tooltip";
import { useTranslation } from "react-i18next";

type ToolbarHeadingSelectProps = {
    disabled: boolean;
    value: string | undefined;
    sectionTypes: ItemOption[];
    onValueChange: (value: string) => void;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
};

const toolbarHeadingSelect = forwardRef<HTMLDivElement, ToolbarHeadingSelectProps>(({
    disabled,
    value,
    sectionTypes,
    onValueChange,
    open,
    onOpenChange
}, ref) => {
    const { t } = useTranslation();

    const selectItem = useCallback((data: ItemOption) => {
        onValueChange(data.value)
    }, [onValueChange])

    return (
        <div ref={ref} className="flex items-center space-x-2 transition-transform duration-300 h-full">
            <AppSeparator orientation="vertical" className="max-h-[70%]" />
            <AppSelect
                open={open}
                onOpenChange={onOpenChange}
                disabled={disabled}
                value={value}
                onValueChange={onValueChange}>
                <ToolbarSelectTooltip
                    tooltip={t('toolbar.headingStyle')}
                    className={cn()}
                    asChild>
                    <AppSelectTrigger className="py-0 border-none leading-normal">
                        <AppSelectValue />
                    </AppSelectTrigger>
                </ToolbarSelectTooltip>
                <AppSelectContent>
                    <List
                        data={sectionTypes}
                        renderItem={(data, index) => (
                            <Fragment key={`section-style-${index}`}>
                                {index > 0 && <AppSelectSeparator />}
                                <AppSelectItem
                                    value={data.value.toString()}
                                    onPointerUp={() => {
                                        selectItem(data)
                                    }}>
                                    {t(data.label)}
                                </AppSelectItem>
                            </Fragment>
                        )}
                    />
                </AppSelectContent>
            </AppSelect>
        </div>
    );
});

export default memo(toolbarHeadingSelect)