import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/ui/button";
import Modal from "../../../../components/ui/modal";
import { useTranslation } from "react-i18next";
import PaginationSetup, { ShowOptions } from "../../../../components/pagination-form";
import { HeaderDisplayMode, HeaderContentType } from "@/utils/headerEnums";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppSeparator from "@/components/app/app-separator";
import Typography from "@/components/Typography";

type CommonSettings = {
    displayMode: HeaderDisplayMode;
    startFromPage?: number;
    sectionsToShow?: number[];
}
interface HeaderSpecificSettings {
    leftContent: HeaderContentType;
    centerContent: HeaderContentType;
    rightContent: HeaderContentType;
}

interface FooterSpecificSettings {
    leftContent: HeaderContentType;
    centerContent: HeaderContentType;
    rightContent: HeaderContentType;
}

interface HeaderFooterModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    initialTab?: "header" | "footer";
    onSave: (headerSettings: HeaderSettings, footerSettings: FooterSettings) => void;
}

const HeaderFooterSettings = ({
    isOpen,
    setIsOpen,
    initialTab = "header",
    onSave,
}: HeaderFooterModalProps) => {
    const { t } = useTranslation();

    const [headerSettings, setHeaderSettings] = useState<HeaderSettings>();
    const [footerSettings, setFooterSettings] = useState<FooterSettings>();

    const [commonState, setCommonState] = useState<CommonSettings>(() => ({
        displayMode: headerSettings?.displayMode || HeaderDisplayMode.NONE,
        startFromPage: headerSettings?.startFromPage || 1,
        sectionsToShow: headerSettings?.sectionsToShow || [],
    }));

    const [headerSpecificState, setHeaderSpecificState] = useState<HeaderSpecificSettings>(() => ({
        leftContent: headerSettings?.leftContent || HeaderContentType.NONE,
        centerContent: headerSettings?.centerContent || HeaderContentType.NONE,
        rightContent: headerSettings?.rightContent || HeaderContentType.NONE,
    }));

    const [footerSpecificState, setFooterSpecificState] = useState<FooterSpecificSettings>(() => ({
        leftContent: footerSettings?.leftContent || HeaderContentType.NONE,
        centerContent: footerSettings?.centerContent || HeaderContentType.NONE,
        rightContent: footerSettings?.rightContent || HeaderContentType.NONE,
    }));

    const [activeTab, setActiveTab] = useState<"header" | "footer">("header");

    useEffect(() => {
        if (headerSettings) {
            setCommonState({
                displayMode: headerSettings.displayMode,
                startFromPage: headerSettings.startFromPage,
                sectionsToShow: headerSettings.sectionsToShow,
            });
            setHeaderSpecificState({
                leftContent: headerSettings.leftContent,
                centerContent: headerSettings.centerContent,
                rightContent: headerSettings.rightContent,
            });
        }
    }, [headerSettings]);

    useEffect(() => {
        if (footerSettings) {
            setFooterSpecificState({
                leftContent: footerSettings.leftContent,
                centerContent: footerSettings.centerContent,
                rightContent: footerSettings.rightContent,
            });
        }
    }, [footerSettings]);

    useEffect(() => {
        if (isOpen) {
            setActiveTab('header');
        }
    }, [isOpen, initialTab]);

    const submitHandler = useCallback(() => {
        const finalHeaderSettings: HeaderSettings = {
            ...commonState,
            ...headerSpecificState
        };

        const finalFooterSettings: FooterSettings = {
            ...commonState,
            ...footerSpecificState
        };

        onSave(finalHeaderSettings, finalFooterSettings);
        setIsOpen(false);
    }, [commonState, headerSpecificState, footerSpecificState, setIsOpen]);

    const handleSetCommonSettings = useCallback((settings: CommonSettings) => {
        setCommonState({ ...settings });
    }, []);

    const handleSetHeaderSettings = useCallback((settings: HeaderSettings) => {
        setHeaderSpecificState({
            leftContent: settings.leftContent,
            centerContent: settings.centerContent,
            rightContent: settings.rightContent,
        });
    }, []);

    const handleSetFooterSettings = useCallback((settings: FooterSettings) => {
        setFooterSpecificState({
            leftContent: settings.leftContent,
            centerContent: settings.centerContent,
            rightContent: settings.rightContent,
        });
    }, []);

    const getCompleteHeaderSettings = (): HeaderSettings => ({
        ...commonState,
        ...headerSpecificState
    });

    const getCompleteFooterSettings = (): FooterSettings => ({
        ...commonState,
        ...footerSpecificState
    });

    const onClose = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    useEffect(() => {
        const loadHeaderSettings = async () => {
            const headerSettings = await window.doc.getHeaderSettings();
            setHeaderSettings(headerSettings);
        }
        loadHeaderSettings();
    }, []);

    useEffect(() => {
        const loadFooterSettings = async () => {
            const footerSettings = await window.doc.getFooterSettings();
            setFooterSettings(footerSettings);
        }
        loadFooterSettings();
    }, []);


    return (
        <Modal
            key="header-footer-settings-modal"
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onClose={onClose}
            title={t('menu.view.headerFooter')}
            className="w-full max-w-full sm:max-w-[37.5em] md:min-w-[37.5em]"
            actions={[
                <Button
                    key="cancel"
                    className="w-full sm:w-[6em]"
                    size="mini"
                    intent="secondary"
                    variant="tonal"
                    onClick={onClose}
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
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <Typography component="h6" className="text-[1.125em] font-bold dark:text-grey-90">
                            {t('headerFooter.show.label')}
                        </Typography>
                    </div>
                    <ShowOptions
                        settings={commonState}
                        setSettings={handleSetCommonSettings}
                    />
                </div>
                <AppSeparator className="my-4" />
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as "header" | "footer")}
                    className="w-full justify-center align-center col-12"
                >
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 justify-center align-center mb-4">
                        <TabsTrigger value="header">{t('headerFooter.header')}</TabsTrigger>
                        <TabsTrigger value="footer">{t('headerFooter.footer')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="header">
                        <PaginationSetup
                            settings={getCompleteHeaderSettings()}
                            setSettings={handleSetHeaderSettings}
                        />
                    </TabsContent>
                    <TabsContent value="footer">
                        <PaginationSetup
                            settings={getCompleteFooterSettings()}
                            setSettings={handleSetFooterSettings}
                        />
                    </TabsContent>
                </Tabs>

            </div>
        </Modal>
    );
};

export default HeaderFooterSettings;