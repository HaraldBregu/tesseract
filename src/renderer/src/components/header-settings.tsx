import { useCallback, useEffect, useState } from "react";
import Button from "./ui/button";
import Modal from "./ui/modal";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PaginationSetup from "./pagination-form";
import { selectHeaderSettings } from "@/pages/editor/store/pagination/pagination.selector";
import { HeaderSettings, updateHeaderSettings } from "@/pages/editor/store/pagination/pagination.slice";

// Definizione dell'interfaccia per le impostazioni
interface HeaderModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const HeaderModal = ({ isOpen, setIsOpen }: HeaderModalProps) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const headerSettings = useSelector(selectHeaderSettings);

    // Inizializza lo stato direttamente dal selettore Redux
    const [settings, setSettings] = useState<HeaderSettings>(() => ({
        displayMode: headerSettings.displayMode,
        startFromPage: headerSettings.startFromPage,
        sectionsToShow: headerSettings.sectionsToShow,
        leftContent: headerSettings.leftContent,
        centerContent: headerSettings.centerContent,
        rightContent: headerSettings.rightContent,
    }));

    // Aggiorna lo stato locale quando cambiano le impostazioni Redux
    useEffect(() => {
        setSettings({ ...headerSettings });
    }, [headerSettings]);

    const submitHandler = useCallback(() => {
        dispatch(updateHeaderSettings(settings));

        setIsOpen(false);
    }, [settings, setIsOpen, dispatch]);

    const handleSetSettings = useCallback((footerSettings: any) => {
        setSettings({
            ...footerSettings,
        });
    }, []);

    return (
        <Modal
            key="header-settings-modal"
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            title={t('headerFooter.header')}
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

export default HeaderModal;