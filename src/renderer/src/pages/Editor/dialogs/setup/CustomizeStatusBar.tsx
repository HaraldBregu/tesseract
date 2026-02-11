import React, { memo, useCallback, useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button";
import { STATUS_BAR_OPTIONS } from "@/utils/optionsEnums";
import { Label } from "@/components/ui/label";

interface CustomizeStatusBarProps {
    isOpen: boolean;
    onCancel: () => void;
    onSave?: (selected: string[]) => void;
}

export const CustomizeStatusBar: React.FC<CustomizeStatusBarProps> = ({
    isOpen,
    onCancel,
    onSave,
}) => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string[]>([]);

    const handleToggle = useCallback((key: string, disabled?: boolean) => {
        if (disabled) return;
        setSelected((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    }, [setSelected]);

    const handleDone = useCallback(() => {
        onSave?.(selected);
    }, [onSave, selected]);

    useEffect(() => {
        window.application.readStatusBarConfig().then(setSelected);
    }, [window.application.readStatusBarConfig]);

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onCancel}
            onClose={onCancel}
            showCloseIcon={true}
            title={t("customizeStatusBar.title")}
            actions={[
                <Button key="cancel" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"secondary"} variant={"tonal"} onClick={onCancel}>{t('buttons.cancel')}</Button>,
                <Button key="save" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"primary"} onClick={handleDone}>
                    {t('buttons.done')}
                </Button>
            ]}
            contentClassName='py-0'
        >
            <Label className="flex text-[13px] mb-2 leading-[15px] text-grey-10 dark:text-grey-80">
                {t("customizeStatusBar.show")}
            </Label>
            <div className="flex flex-col gap-2">
                {STATUS_BAR_OPTIONS.map((option) => (
                    <Label
                        key={option.key}
                        className={cn(
                            "flex items-center gap-3 rounded cursor-pointer text-semibold text-[13px] leading-[15px] text-grey-10 dark:text-grey-80",
                            option.disabled && "cursor-not-allowed text-grey-50"
                        )}
                    >
                        <Checkbox
                            checked={selected.includes(option.key)}
                            disabled={option.disabled}
                            onCheckedChange={() =>
                                handleToggle(option.key, option.disabled)
                            }
                            className={cn(
                                "data-[state=checked]:bg-primary data-[state=checked]:border-primary border-grey-50 border-2 w-6 h-6",
                                option.disabled && "pointer-events-none data-[state=checked]:bg-grey-60 data-[state=checked]:border-grey-60"
                            )}
                        />
                        {t(option.label)}
                    </Label>
                ))}
            </div>
        </Modal>
    );
};

export default memo(CustomizeStatusBar);