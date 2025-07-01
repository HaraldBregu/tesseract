import { useCallback, useEffect, useState } from "react";
import Button from "../../../components/ui/button";
import Modal from "../../../components/ui/modal";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PaginationSetup from "../../../components/pagination-form";
import { selectHeaderSettings } from "@/pages/editor/store/pagination/pagination.selector";
import { type HeaderSettings, updateHeaderSettings } from "@/pages/editor/store/pagination/pagination.slice";
import { HeaderDisplayMode, HeaderContentType } from "@/utils/headerEnums";

interface HeaderModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const HeaderSettings = ({ isOpen, setIsOpen }: HeaderModalProps) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const headerSettings = useSelector(selectHeaderSettings);

    const [settings, setSettings] = useState<HeaderSettings>(() => ({
        displayMode: headerSettings?.displayMode || HeaderDisplayMode.NONE,
        startFromPage: headerSettings?.startFromPage || 1,
        sectionsToShow: headerSettings?.sectionsToShow || [],
        leftContent: headerSettings?.leftContent || HeaderContentType.NONE,
        centerContent: headerSettings?.centerContent || HeaderContentType.NONE,
        rightContent: headerSettings?.rightContent || HeaderContentType.NONE,
    }));

    useEffect(() => {
        if (headerSettings) {
            setSettings({ ...headerSettings });
        }
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
            className="w-full max-w-full sm:max-w-[37.5em] md:min-w-[37.5em]"
            actions={[
                <Button
                    key="cancel"
                    className="w-full sm:w-[6em]"
                    size="mini"
                    intent="secondary"
                    variant="tonal"
                    onClick={() => setIsOpen(false)}
                >
                    {t('buttons.cancel')}
                </Button>,
                <Button
                    key="save"
                    className="w-full sm:w-[6em]"
                    size="mini"
                    intent="primary"
                    onClick={submitHandler}
                >
                    {t('buttons.done')}
                </Button>
            ]}
        >
            <div className="max-h-[70vh] overflow-y-auto">
                <PaginationSetup
                    settings={settings}
                    setSettings={handleSetSettings}
                />
            </div>
        </Modal>
    );
};

export default HeaderSettings;