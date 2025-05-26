import { useCallback, useEffect, useState } from "react";
import Button from "./ui/button";
import Modal from "./ui/modal";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PaginationSetup from "./pagination-form";
import { selectFooterSettings } from "@/pages/editor/store/pagination/pagination.selector";
import { FooterSettings, updateFooterSettings } from "@/pages/editor/store/pagination/pagination.slice";

// Definizione dell'interfaccia per le impostazioni
interface FooterModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const FooterModal = ({ isOpen, setIsOpen }: FooterModalProps) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const footerSettings = useSelector(selectFooterSettings);

    // Inizializza lo stato direttamente dal selettore Redux
    const [settings, setSettings] = useState<FooterSettings>(() => ({
        displayMode: footerSettings.displayMode,
        startFromPage: footerSettings.startFromPage ?? 1, // Provide default value if undefined
        sectionsToShow: footerSettings.sectionsToShow,
        leftContent: footerSettings.leftContent,
        centerContent: footerSettings.centerContent,
        rightContent: footerSettings.rightContent,
    }));

    // Aggiorna lo stato locale quando cambiano le impostazioni Redux
    useEffect(() => {
        setSettings({ ...footerSettings });
    }, [footerSettings]);

    const submitHandler = useCallback(() => {
        dispatch(updateFooterSettings(settings));

        setIsOpen(false);
    }, [settings, setIsOpen, dispatch]);

    const handleSetSettings = useCallback((footerSettings: any) => {
        setSettings({
            ...footerSettings,
        });
    }, []);

    return (
        <Modal
            key="footer-settings-modal"
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            title={t('headerFooter.footer')}
            className="min-w-[600px]"
            actions={[
                <Button
                    key="cancel"
                    className="w-24"
                    size="mini"
                    intent="secondary"
                    variant="tonal"
                    onClick={() => setIsOpen(false)}
                >
                    {t('buttons.cancel')}
                </Button>,
                <Button
                    key="save"
                    className="w-24"
                    size="mini"
                    intent="primary"
                    onClick={submitHandler}
                >
                    {t('buttons.done')}
                </Button>
            ]}
        >
            <PaginationSetup
                settings={settings}
                setSettings={handleSetSettings}
            />
        </Modal>
    );
};

export default FooterModal;