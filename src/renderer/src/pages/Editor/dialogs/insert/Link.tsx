import AppButton from "@/components/app/app-button";
import { AppDraggableDialog, AppDraggableDialogContent, AppDraggableDialogHeader, AppDraggableDialogTitle, AppDraggableDialogDescription, AppDraggableDialogFooter } from "@/components/app/app-draggable-dialog";
import AppInput from "@/components/app/app-input";
import IconClose from "@/components/app/icons/IconClose";
import { cn } from "@/lib/utils";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

interface LinkProps {
    isOpen: boolean;
    onCancel: () => void;
    onDone: (link: string) => void;
    onRemove: () => void;
    currentLink?: string;
}

const Link = ({ isOpen, onCancel, onDone, onRemove, currentLink = '' }: LinkProps) => {
    const { t } = useTranslation();
    const [link, setLink] = useState<string>(currentLink);
    const [disabled, setDisabled] = useState<boolean>(() => !isValidUrl(currentLink));

    function isValidUrl(url: string) {
        if (!url || url.trim().length === 0) return false;
        
        const trimmedUrl = url.trim();
        
        const urlToTest = /^https?:\/\//i.test(trimmedUrl) 
            ? trimmedUrl 
            : `https://${trimmedUrl}`;
        
        try {
            const parsed = new URL(urlToTest);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:' 
                && parsed.hostname.includes('.');
        } catch {
            return false;
        }
    }

    const handleInsertLink = useCallback(() => {
        // Aggiungi https:// se il link non ha un protocollo
        let finalLink = link.trim();
        if (!/^https?:\/\//i.test(finalLink)) {
            finalLink = `https://${finalLink}`;
        }
        onDone(finalLink);
    }, [link, onDone]);

    const handleRemoveLink = useCallback(() => {
        onDone('');
        onRemove();
    }, [onRemove]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLink(value);
        setDisabled(!isValidUrl(value));
    }, []);


    return (
        <AppDraggableDialog open={isOpen} onOpenChange={onCancel}>
            <AppDraggableDialogContent className={cn("max-w-md max-h-[70vh]")}>
                <AppDraggableDialogHeader>
                    <div className="flex justify-between items-center">
                        <AppDraggableDialogTitle className={cn("text-md font-bold flex-1")}>
                            {t("toolbar.insertLink", "##Insert Link##")}
                        </AppDraggableDialogTitle>
                        <AppButton
                            variant="transparent"
                            size="icon-sm"
                            onClick={(onCancel)}
                            aria-label={t("dialog.close", "Close")}
                            className="ml-2">
                            <IconClose />
                        </AppButton>
                        <AppDraggableDialogDescription />
                    </div>
                </AppDraggableDialogHeader>
                <div className="p-4 overflow-y-auto max-h-[380px]">
                    <div className="flex-1 h-full overflow-y-auto">
                        <AppInput
                            type="url"
                            value={link}
                            onChange={handleInputChange}
                            placeholder={t('linkPlaceholder')}
                        />
                    </div>
                </div>
                <AppDraggableDialogFooter>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="outline"
                        onClick={onCancel}>
                        <span>{t("buttons.cancel", "##Cancel##")}</span>
                    </AppButton>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        disabled={currentLink.length === 0}
                        variant="secondary"
                        onClick={handleRemoveLink}>
                        <span>{t("buttons.remove", "Remove")}</span>
                    </AppButton>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="default"
                        onClick={handleInsertLink}
                        disabled={disabled}>
                        <span>{t("buttons.insert", "##Insert##")}</span>
                    </AppButton>
                </AppDraggableDialogFooter>
            </AppDraggableDialogContent>
        </AppDraggableDialog>
    )
}

export default memo(Link);