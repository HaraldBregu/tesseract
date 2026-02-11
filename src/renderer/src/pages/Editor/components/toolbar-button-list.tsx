import { memo, useMemo } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import AppButton from "@/components/app/app-button";
import IconList from "@/components/app/icons/IconList";
import { AppDropdownMenu, AppDropdownMenuContent, AppDropdownMenuItem, AppDropdownMenuSeparator, AppDropdownMenuTrigger } from "@/components/app/app-dropdown-menu";
import { cn } from "@/lib/utils";
import { getListTypeByStyle } from "@/utils/listUtils";
import { useTranslation } from "react-i18next";
import IconListNumber from "@/components/app/icons/IconListNumber";
import IconListUppercase from "@/components/app/icons/IconListUppercase";
import IconListLowercase from "@/components/app/icons/IconListLowercase";
import IconListUpperRoman from "@/components/app/icons/IconListUpperRoman";
import IconListLowerRoman from "@/components/app/icons/IconListLowerRoman";
import IconListBullet from "@/components/app/icons/IconListBullet";
import IconListBullet_empty from "@/components/app/icons/IconListBullet_empty";
import IconListSquareBullet from "@/components/app/icons/IconListSquareBullet";

type ToolbarButtonListProps = {
    title: string;
    disabled: boolean;
    tabIndex: number;
    currentListValue: ListStyle;
    onSelectListChange: (listStyle: ListStyle) => void;
    onShowResumeNumbering?: () => void;
    continuePreviousNumbering?: () => void;
    resumeNumberingTitle: string;
    continuePreviousNumberingTitle: string;
}

export const ToolbarButtonList = memo(({
    title,
    disabled,
    tabIndex,
    currentListValue,
    onSelectListChange,
    onShowResumeNumbering,
    continuePreviousNumbering,
    resumeNumberingTitle,
    continuePreviousNumberingTitle
}: ToolbarButtonListProps) => {

    const { t } = useTranslation();

    const bulletList = useMemo<BulletList[]>(() => ([
        {
            label: t('toolbar.listNumber'),
            value: 'decimal',
            icon: IconListNumber,
            onClick: (value: ListStyle) => {

                onSelectListChange(value)
            }
        },
        {
            label: t('toolbar.listUppercase'),
            value: 'upper-alpha',
            icon: IconListUppercase,
            onClick: (value: ListStyle) => onSelectListChange(value)
        },
        {
            label: t('toolbar.listLowercase'),
            value: 'lower-alpha',
            icon: IconListLowercase,
            onClick: (value: ListStyle) => onSelectListChange(value)
        },
        {
            label: t('toolbar.listUpperRoman'),
            value: 'upper-roman',
            icon: IconListUpperRoman,
            onClick: (value: ListStyle) => onSelectListChange(value)
        },
        {
            label: t('toolbar.listLowerRoman'),
            value: 'lower-roman',
            icon: IconListLowerRoman,
            onClick: (value: ListStyle) => onSelectListChange(value)
        },
        {
            label: t('toolbar.listBullet'),
            value: 'disc',
            icon: IconListBullet,
            onClick: (value: ListStyle) => onSelectListChange(value)
        },
        {
            label: t('toolbar.listBulletEmpty'),
            value: 'circle',
            icon: IconListBullet_empty,
            onClick: (value: ListStyle) => onSelectListChange(value)
        },
        {
            label: t('toolbar.listBulletSquare'),
            value: 'square',
            icon: IconListSquareBullet,
            onClick: (value: ListStyle) => onSelectListChange(value)
        }
    ]), []);

    return (
        <AppDropdownMenu modal={false}>
            <AppDropdownMenuTrigger
                disabled={disabled}
                className={
                    cn(
                        "leading-none rounded-sm",
                        "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-50 dark:[&>svg]:hover:!bg-transparent",
                        "disabled:!bg-transparent hover:!bg-grey-80 dark:disabled:!bg-transparent dark:hover:!bg-grey-50",)
                }>
                <ToolbarButtonTooltip
                    tooltip={title}
                    disabled={disabled}>
                    <AppButton
                        tabIndex={tabIndex}
                        asChild
                        variant="toolbar"
                        size="icon"
                        rounded="sm"
                        aria-label={title}
                        aria-disabled={disabled}
                        disabled={disabled}>
                        <IconList />
                    </AppButton>
                </ToolbarButtonTooltip>
            </AppDropdownMenuTrigger>
            <AppDropdownMenuContent className="p-[.5rem]">
                <div className="flex items-center py-[.5rem] gap-3">
                    {
                        bulletList.map((dt, index) => (
                            <AppDropdownMenuItem className='p-0' tabIndex={tabIndex + index + 1} key={`list-${index}`} onClick={() => {
                                if (currentListValue === dt.value) {
                                    dt.onClick("")
                                    return;
                                }
                                dt.onClick(dt.value)
                            }}>
                                <ToolbarButtonTooltip tooltip={dt.label}>
                                    <AppButton
                                        asChild
                                        variant={currentListValue === dt.value ? 'toolbar-selected' : "toolbar"}
                                        size="icon"
                                        rounded="sm"
                                        aria-label={dt.label}
                                        aria-disabled={disabled}
                                        disabled={disabled}>
                                        <dt.icon />
                                    </AppButton>
                                </ToolbarButtonTooltip>
                            </AppDropdownMenuItem>
                        ))
                    }
                </div>
                <AppDropdownMenuSeparator />
                <AppDropdownMenuItem
                    disabled={getListTypeByStyle(currentListValue) !== 'ORDER'}
                    tabIndex={tabIndex + bulletList.length + 1} className="p-[.25rem]"
                    onClick={onShowResumeNumbering}
                >
                    {resumeNumberingTitle}
                </AppDropdownMenuItem>
                <AppDropdownMenuItem
                    disabled={getListTypeByStyle(currentListValue) !== 'ORDER'}
                    tabIndex={tabIndex + bulletList.length + 1} className="p-[.25rem]"
                    onClick={continuePreviousNumbering}
                >
                    {continuePreviousNumberingTitle}
                </AppDropdownMenuItem>
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    );
});