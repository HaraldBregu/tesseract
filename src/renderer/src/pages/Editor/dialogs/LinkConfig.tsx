import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

interface LinkConfigProps {
    isOpen: boolean;
    onCancel: () => void;
    onDone: (link: string) => void;
    currentLink?: string;
}

const LinkConfig = ({ isOpen, onCancel, onDone, currentLink = 'http://' }: LinkConfigProps) => {
    const { t } = useTranslation();

    const [link, setLink] = useState<string>(currentLink);

    const [disabled, setDisabled] = useState<boolean>(() => !isValidUrl(currentLink));

    function isValidUrl(url: string) {
        try {
            const parsed = new URL(url);
            return (parsed.protocol === "http:" || parsed.protocol === "https:") && url.startsWith(`${parsed.protocol}//`);
        } catch {
            return false;
        }
    }

    const handleInsertLink = useCallback(() => {
        onDone(link);
    }, [link, onDone]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLink(value);
        setDisabled(!isValidUrl(value));
    }, []);

    return (
        <Modal
            key={"add-symbol-modal"}
            isOpen={isOpen}
            onOpenChange={onCancel}
            title={t('toolbar.insertLink')}
            contentClassName="flex flex-col gap-8 px-4 pt-4 pb-4 overflow-hidden flex-1"
            footerClassName='h-[auto] py-4'
            headerClassName="py-2 h-12 leading-[18px] items-center justify-center"
            showCloseIcon={true}
            actions={[
                <Button key="cancel" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"secondary"} variant={"tonal"} onClick={onCancel}>{t('buttons.cancel')}</Button>,
                <Button key="save" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"primary"} onClick={handleInsertLink} disabled={disabled}>
                    {t('buttons.insert')}
                </Button>
            ]}
        >
            <Input
                type="url"
                value={link}
                onInput={handleInputChange}
                placeholder={t('linkPlaceholder')}
                className="border border-gray-300 dark:text-foreground rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </Modal>
    );
}

export default LinkConfig;