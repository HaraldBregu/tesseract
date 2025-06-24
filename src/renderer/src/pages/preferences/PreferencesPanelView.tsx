import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Button from "@/components/ui/button";
import Typography from "@/components/Typography";
import AppRadioGroup from "@/components/app-radiogroup";
import AppCheckbox from "@/components/app-checkbox";
import CustomSelect from "@/components/ui/custom-select";
import Divider from '@/components/ui/divider';
import TextField from "@/components/ui/textField";
import Folder from '@/components/icons/Folder';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider, useTheme } from "../../providers/theme-provider";
import {
    getSidebarItems, getFileNameOptions,
    // getLinksOptions,
    getThemeOptions,
    // characterLimitOptions,
    getFileSavingOptions, getAutomaticSaveOptions, getVersioningOptions, languageOptions, regionOptions, dateTimeFormatOptions
} from './utils';

const PreferencesPanelView = () => {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();

    // Stato per la sezione attiva nella sidebar
    const [activeSection, setActiveSection] = useState('general');

    // Stati per le preferenze General
    const [fileNameDisplay, setFileNameDisplay] = useState<'full' | 'filename'>('full');
    const [rememberLayout, setRememberLayout] = useState(true);
    const [recentFilesCount, setRecentFilesCount] = useState(10);
    // const [linksBehavior, setLinksBehavior] = useState('default');

    // Stati per le preferenze Appearance
    const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(theme);
    const [commentPreviewLimit, setCommentPreviewLimit] = useState('20');
    const [bookmarkPreviewLimit, setBookmarkPreviewLimit] = useState('20');

    // Stati per le preferenze File
    const [fileSavingDirectory, setFileSavingDirectory] = useState('last');
    const [defaultDirectory, setDefaultDirectory] = useState('~/Username/Documents/');
    const [automaticFileSave, setAutomaticFileSave] = useState('never');
    const [versioningDirectory, setVersioningDirectory] = useState('default');
    const [customVersioningDirectory, setCustomVersioningDirectory] = useState('~/Username/Documents/');
    // const [defaultEncoding, setDefaultEncoding] = useState('utf8');
    // const [encodingDetection, setEncodingDetection] = useState(true);
    // const [restoreLayout, setRestoreLayout] = useState(true);

    // Stati per le preferenze Language & Region
    const [criterionLanguage, setCriterionLanguage] = useState('en');
    const [criterionRegion, setCriterionRegion] = useState('IT');
    const [dateTimeFormat, setDateTimeFormat] = useState('DD/MM/YYYY HH:MM:SS');

    // Stati per le preferenze Editing
    const [historyActionsCount, setHistoryActionsCount] = useState('10');

    // Load preferences when component mounts
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const preferences = await window.preferences.getPreferences();
                if (preferences.fileNameDisplay) {
                    setFileNameDisplay(preferences.fileNameDisplay);
                }
                if (preferences.rememberLayout !== undefined) {
                    setRememberLayout(preferences.rememberLayout);
                }
                if (preferences.recentFilesCount !== undefined) {
                    setRecentFilesCount(preferences.recentFilesCount);
                }
                if (preferences.theme !== undefined) {
                    setSelectedTheme(preferences.theme);
                }
                if (preferences.commentPreviewLimit !== undefined) {
                    setCommentPreviewLimit(preferences.commentPreviewLimit);
                }
                if (preferences.bookmarkPreviewLimit !== undefined) {
                    setBookmarkPreviewLimit(preferences.bookmarkPreviewLimit);
                }
                if (preferences.fileSavingDirectory !== undefined) {
                    setFileSavingDirectory(preferences.fileSavingDirectory);
                }
                if (preferences.defaultDirectory !== undefined) {
                    setDefaultDirectory(preferences.defaultDirectory);
                }
                if (preferences.automaticFileSave !== undefined) {
                    setAutomaticFileSave(preferences.automaticFileSave);
                }
                if (preferences.versioningDirectory !== undefined) {
                    setVersioningDirectory(preferences.versioningDirectory);
                }
                if (preferences.customVersioningDirectory !== undefined) {
                    setCustomVersioningDirectory(preferences.customVersioningDirectory);
                }
                if (preferences.criterionLanguage !== undefined) {
                    setCriterionLanguage(preferences.criterionLanguage);
                }
                if (preferences.criterionRegion !== undefined) {
                    setCriterionRegion(preferences.criterionRegion);
                }
                if (preferences.dateTimeFormat !== undefined) {
                    setDateTimeFormat(preferences.dateTimeFormat);
                }
                if (preferences.historyActionsCount !== undefined) {
                    setHistoryActionsCount(preferences.historyActionsCount);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            }
        };

        loadPreferences();
    }, []);



    const handleSave = useCallback(async () => {
        const preferences: Preferences = {
            fileNameDisplay,
            rememberLayout,
            recentFilesCount,
            theme: selectedTheme as 'light' | 'dark' | 'system',
            commentPreviewLimit,
            bookmarkPreviewLimit,
            fileSavingDirectory,
            defaultDirectory,
            automaticFileSave,
            versioningDirectory,
            customVersioningDirectory,
            criterionLanguage,
            criterionRegion,
            dateTimeFormat,
            historyActionsCount
        };

        // Send preferences to main process
        setTheme(selectedTheme);
        window.preferences.savePreferences(preferences);

        await window.application.closeChildWindow();
    }, [
        fileNameDisplay,
        rememberLayout,
        recentFilesCount,
        selectedTheme,
        commentPreviewLimit,
        bookmarkPreviewLimit,
        fileSavingDirectory,
        defaultDirectory,
        automaticFileSave,
        versioningDirectory,
        customVersioningDirectory,
        criterionLanguage,
        criterionRegion,
        dateTimeFormat,
        historyActionsCount,
        setTheme
    ]);

    const handleReset = useCallback(() => {
        // Reset ai valori predefiniti
        setFileNameDisplay('full');
        setRememberLayout(true);
        setRecentFilesCount(10);
        // setLinksBehavior('default');
        setSelectedTheme('system');
        setCommentPreviewLimit('50');
        setBookmarkPreviewLimit('50');
        setFileSavingDirectory('last');
        setDefaultDirectory('~/Username/Documents/');
        setAutomaticFileSave('never');
        setVersioningDirectory('default');
        setCustomVersioningDirectory('~/Username/Documents/');
        // setDefaultEncoding('utf8');
        // setEncodingDetection(true);
        // setRestoreLayout(true);
        setCriterionLanguage('en-UK');
        setCriterionRegion('IT');
        setDateTimeFormat('DD/MM/YYYY HH:MM:SS');
        setHistoryActionsCount('10');
    }, []);

    const renderGeneralContent = () => (
        <div className="space-y-6">
            {/* File name display */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t('preferences.general.fileNameDisplay.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppRadioGroup
                        items={getFileNameOptions(t).map(option => ({
                            value: option.value,
                            label: option.label,
                            description: option.description,
                            className: "text-[13px]"
                        }))}
                        value={fileNameDisplay}
                        onValueChange={(value: string) => setFileNameDisplay(value as 'full' | 'filename')}
                    />
                </div>
            </div>
            <Divider orientation='horizontal' className="my-2" />
            {/* Restore Criterion layout */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t('preferences.general.restoreCriterionLayout.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="space-y-2">
                        <AppCheckbox
                            checked={rememberLayout}
                            onCheckedChange={setRememberLayout}
                            labelClassName='text-[14px]'
                            label={t('preferences.general.restoreCriterionLayout.rememberLastLayout')}
                        />
                        <Typography component="p" className="text-[11px] text-grey-50 dark:text-grey-70 ml-6">
                            {t('preferences.general.restoreCriterionLayout.rememberLastLayoutDescription')}
                        </Typography>
                    </div>
                </div>
            </div>
            <Divider orientation='horizontal' className="my-2" />
            {/* Recent files to open */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t('preferences.general.recentFiles.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="flex items-center gap-3">
                        <TextField
                            id="recentFilesCount"
                            type="number"
                            min={1}
                            max={10}
                            value={recentFilesCount.toString()}
                            onChange={e => setRecentFilesCount(parseInt(e.target.value, 10))}
                            className="w-16"
                        />
                    </div>
                    <Typography component="p" className="text-[11px] text-grey-50 dark:text-grey-70 mt-2">
                        {t('preferences.general.recentFiles.description')}
                    </Typography>
                </div>
            </div>
            {/* <Divider orientation='horizontal' className="my-2" /> */}

            {/* Links */}
            {/* <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t('preferences.general.links.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppRadioGroup
                        items={linksOptions.map(option => ({
                            value: option.value,
                            label: option.label,
                            className: "text-[13px] text-bold"
                        }))}
                        value={linksBehavior}
                        onValueChange={setLinksBehavior}
                    />
                </div>
            </div> */}
        </div>
    );

    const renderAppearanceContent = () => (
        <div className="space-y-6">
            {/* Theme */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t('preferences.appearance.theme.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppRadioGroup
                        items={getThemeOptions(t).map(option => ({
                            value: option.value,
                            label: option.label,
                            className: "text-[13px]"
                        }))}
                        value={selectedTheme}
                        onValueChange={(value: string) => setSelectedTheme(value as 'light' | 'dark' | 'system')}
                    />
                </div>
            </div>

            <Divider orientation='horizontal' className="my-2" />

            {/* Comment preview character limit */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[12px] font-semibold mb-3 ml-12">
                        {t('preferences.appearance.commentPreviewLimit.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="flex items-center gap-3">
                        <TextField
                            id="commentPreviewLimit"
                            type="number"
                            value={commentPreviewLimit}
                            onChange={(e) => setCommentPreviewLimit(e.target.value)}
                            className="w-24 text-[13px]"
                            min="1"
                            max="50"
                        />
                    </div>
                    <Typography component="p" className="text-[11px] text-grey-50 dark:text-grey-70 mt-2">
                        {t('preferences.appearance.commentPreviewLimit.description')}
                    </Typography>
                </div>
            </div>

            <Divider orientation='horizontal' className="my-2" />

            {/* Bookmark preview character limit */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[12px] font-semibold mb-3 ml-12">
                        {t('preferences.appearance.bookmarkPreviewLimit.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="flex items-center gap-3">
                        <TextField
                            id="bookmarkPreviewLimit"
                            type="number"
                            value={bookmarkPreviewLimit}
                            onChange={(e) => setBookmarkPreviewLimit(e.target.value)}
                            className="w-24 text-[13px]"
                            min="1"
                            max="50"
                        />
                    </div>
                    <Typography component="p" className="text-[11px] text-grey-50 dark:text-grey-70 mt-2">
                        {t('preferences.appearance.bookmarkPreviewLimit.description')}
                    </Typography>
                </div>
            </div>
        </div>
    );

    // Aggiungi una funzione per aprire il dialog di selezione cartella
    const handleSelectDirectory = async () => {
        window.electron.ipcRenderer.send("select-folder-path")
        window.electron.ipcRenderer.on("receive-folder-path", (_, path) => {
            if (path?.length > 0)
                setDefaultDirectory(path)
        })
    };

    const renderFileContent = () => (
        <div className="space-y-6">
            {/* File saving directory */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t('preferences.file.fileSavingDirectory.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="space-y-2">
                        <AppRadioGroup
                            items={getFileSavingOptions(t).map(option => ({
                                value: option.value,
                                label: option.label,
                                className: "text-[13px]"
                            }))}
                            value={fileSavingDirectory}
                            onValueChange={setFileSavingDirectory}
                        />
                        <div className="ml-6 mt-2">
                            <TextField
                                id="defaultDirectory"
                                type="text"
                                value={defaultDirectory}
                                disabled={fileSavingDirectory !== 'default'}
                                onChange={(e) => setDefaultDirectory(e.target.value)}
                                placeholder={t('preferences.file.selectPath')}
                                className="text-[11px]"
                                rightIcon={
                                    <Button
                                        size="mini"
                                        intent="secondary"
                                        variant="icon"
                                        onClick={handleSelectDirectory}
                                    >
                                        <Folder variant="tonal" intent="secondary" size="small" />
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Divider orientation='horizontal' className="my-2" />

            {/* Automatic file save */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t('preferences.file.automaticFileSave.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppRadioGroup
                        items={getAutomaticSaveOptions(t).map(option => ({
                            value: option.value,
                            label: option.label,
                            className: "text-[13px]"
                        }))}
                        value={automaticFileSave}
                        onValueChange={setAutomaticFileSave}
                    />
                </div>
            </div>

            <Divider orientation='horizontal' className="my-2" />

            {/* Versioning directory */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t('preferences.file.versioningDirectory.title')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="space-y-2">
                        <AppRadioGroup
                            items={getVersioningOptions(t).map(option => ({
                                value: option.value,
                                label: option.label,
                                className: "text-[13px]"
                            }))}
                            value={versioningDirectory}
                            onValueChange={setVersioningDirectory}
                        />
                        <div className="ml-6 mt-2">
                            <TextField
                                id="customVersioningDirectory"
                                type="text"
                                value={customVersioningDirectory}
                                onChange={(e) => setCustomVersioningDirectory(e.target.value)}
                                placeholder={t('preferences.file.selectPath')}
                                className="text-[11px]"
                                disabled={versioningDirectory !== 'custom'}
                                rightIcon={
                                    <Button
                                        size="mini"
                                        intent="secondary"
                                        variant="icon"
                                        disabled={versioningDirectory !== 'custom'}
                                        onClick={handleSelectCustomVersioningDirectory}
                                    >
                                        <Folder variant="tonal" intent="secondary" size="small" />
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* <Divider orientation='horizontal' className="my-2" /> */}

            {/* Default encoding */}
            {/* <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        Default encoding
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppRadioGroup
                        items={encodingOptions.map(option => ({
                            value: option.value,
                            label: option.label,
                            className: "text-[13px]"
                        }))}
                        value={defaultEncoding}
                        onValueChange={setDefaultEncoding}
                    />
                </div>
            </div> */}

            {/* <Divider orientation='horizontal' className="my-2" /> */}

            {/* Encoding detection */}
            {/* <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        Encoding detection
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppCheckbox
                        checked={encodingDetection}
                        onCheckedChange={setEncodingDetection}
                        labelClassName='text-[13px]'
                        label="Enable"
                    />
                </div>
            </div> */}

            {/* <Divider orientation='horizontal' className="my-2" /> */}

            {/* Restore layout */}
            {/* <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        Restore layout
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="space-y-2">
                        <AppCheckbox
                            checked={restoreLayout}
                            onCheckedChange={setRestoreLayout}
                            labelClassName='text-[13px]'
                            label="Remember the last visual layout"
                        />
                        <Typography component="p" className="text-[11px] text-grey-50 dark:text-grey-70 ml-6">
                            Saves and restores the last visual layout of the editing session.
                        </Typography>
                    </div>
                </div>
            </div> */}
        </div>
    );

    // Aggiungi anche la funzione per la cartella di versioning personalizzata
    const handleSelectCustomVersioningDirectory = async () => {
        window.electron.ipcRenderer.send("select-folder-path")
        window.electron.ipcRenderer.on("receive-folder-path", (_, path) => {
            if (path?.length > 0)
                setCustomVersioningDirectory(path)
        })
    };

    const renderLanguageContent = () => (
        <div className="space-y-6">
            {/* Criterion Language */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[13px] font-semibold">
                        {t('preferences.language.criterionLanguage')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="w-60 border border-grey-70 rounded-md">
                        <CustomSelect
                            value={criterionLanguage}
                            onValueChange={setCriterionLanguage}
                            items={languageOptions}
                            minWidth="192px"
                            triggerClassName="w-full border-none bg-transparent p-1"
                        />
                    </div>
                </div>
            </div>
            {/* Criterion Region */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[13px] font-semibold">
                        {t('preferences.language.criterionRegion')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="w-60 border border-grey-70 rounded-md">
                        <CustomSelect
                            value={criterionRegion}
                            onValueChange={setCriterionRegion}
                            items={regionOptions}
                            minWidth="192px"
                            triggerClassName="w-full border-none bg-transparent p-1"
                        />
                    </div>
                </div>
            </div>
            {/* Date & Time format */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[13px] font-semibold">
                        {t('preferences.language.dateTimeFormat')}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="w-60 border border-grey-70 rounded-md ">
                        <CustomSelect
                            value={dateTimeFormat}
                            onValueChange={setDateTimeFormat}
                            items={dateTimeFormatOptions}
                            minWidth="192px"
                            triggerClassName="w-full border-none bg-transparent p-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEditingContent = () => (
        <div className="space-y-6">
            {/* Show history actions */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[13px] font-semibold mb-3">
                        {t('preferences.editing.showHistoryActions.title')}
                    </Typography>
                </div>
                <div className="col-span-8 ">
                    <div className="flex items-center gap-3 ">
                        <TextField
                            id="historyActionsCount"
                            type="number"
                            value={historyActionsCount}
                            onChange={(e) => setHistoryActionsCount(e.target.value)}
                            className="w-32 text-[13px] "
                            min="1"
                            max="100"
                        />
                    </div>
                    <Typography component="p" className="text-[11px] text-grey-50 dark:text-grey-70 mt-2">
                        {t('preferences.editing.showHistoryActions.description')}
                    </Typography>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'general':
                return renderGeneralContent();
            case 'appearance':
                return renderAppearanceContent();
            case 'file':
                return renderFileContent();
            case 'language':
                return renderLanguageContent();
            case 'editing':
                return renderEditingContent();
            case 'account':
                return <div className="p-4">{t('preferences.comingSoon')}</div>;
            default:
                return renderGeneralContent();
        }
    };

    return (
        <div className="fixed inset-0">
            {/* Main Content Area with explicit height calculation */}
            <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
                <SidebarProvider defaultOpen={true} style={{ height: 'calc(100vh - 3.5rem)' }}>
                    <Sidebar collapsible="offcanvas" style={{ height: 'calc(100vh - 3.5rem)' }} className="border-t border-grey-70 dark:border-grey-40">
                        <SidebarContent style={{ height: 'calc(100vh - 3.5rem)' }}>
                            <div className="h-full bg-grey-90 dark:bg-grey-20 border-r">
                                <div className="p-2 h-full overflow-y-auto">
                                    {getSidebarItems(t).map((item) => (
                                        <div
                                            key={item.id}
                                            className={`
                                                    px-3 py-2 text-sm cursor-pointer rounded mb-1
                                                    ${activeSection === item.id
                                                    ? 'bg-primary-50 text-white font-medium'
                                                    : 'text-grey-10 dark:text-grey-90 hover:bg-gray-100 hover:dark:bg-grey-30'
                                                }`}
                                            onClick={() => setActiveSection(item.id)}
                                        >
                                            {item.label}
                                            {activeSection !== item.id && (
                                                <span className="float-right text-gray-400">›</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SidebarContent>
                    </Sidebar>
                    <SidebarInset style={{ height: 'calc(100vh - 3.5rem)' }} className="flex flex-col ">
                        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-grey-95 dark:bg-grey-10">
                            {renderContent()}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </div>

            {/* Fixed Footer */}
            <div className="absolute bottom-0 left-0 right-0 flex h-14 items-center gap-2 border-t bg-background px-3 z-50 bg-grey-90 dark:bg-grey-20">
                <div className="flex items-end justify-end gap-2 w-full">
                    <Button
                        key="cancel"
                        className="w-20"
                        size="mini"
                        intent="secondary"
                        variant="tonal"
                        onClick={async () => await window.application.closeChildWindow()}
                    >
                        {t('preferences.buttons.cancel')}
                    </Button>
                    <Button
                        key="reset"
                        className="w-32"
                        size="mini"
                        intent="primary"
                        variant="tonal"
                        onClick={handleReset}
                    >
                        {t('preferences.buttons.resetToDefault')}
                    </Button>
                    <Button
                        key="ok"
                        className="w-16"
                        size="mini"
                        intent="primary"
                        onClick={handleSave}
                    >
                        {t('preferences.buttons.ok')}
                    </Button>
                </div>
            </div>
        </div>
    )
};

const PreferencesPanelViewWithTheme = () => {
    return (
        <ThemeProvider>
            <PreferencesPanelView />
        </ThemeProvider>
    )
}

export default PreferencesPanelViewWithTheme;