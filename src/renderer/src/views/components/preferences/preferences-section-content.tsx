import type { ReactElement } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { PreferencesAccountSection } from "./preferences-account-section";
import { PreferencesAppearanceSection } from "./preferences-appearance-section";
import { PreferencesFileSection } from "./preferences-file-section";
import { PreferencesGeneralSection } from "./preferences-general-section";
import { PreferencesLanguageSection } from "./preferences-language-section";
import type { AccountProfileFormData } from "../../../utils/accountProfileSchema";

interface PreferencesSectionContentProps {
    readonly activeSection: string;
    readonly t: (key: string) => string;
    readonly fileNameDisplay: "full" | "filename";
    readonly setFileNameDisplay: (value: "full" | "filename") => void;
    readonly rememberLayout: boolean;
    readonly setRememberLayout: (value: boolean) => void;
    readonly pdfQuality: string;
    readonly setPdfQuality: (value: string) => void;
    readonly recentFilesCount: number;
    readonly setRecentFilesCount: (value: number) => void;
    readonly selectedTheme: "light" | "dark";
    readonly setSelectedTheme: (value: "light" | "dark") => void;
    readonly commentPreviewLimit: string;
    readonly setCommentPreviewLimit: (value: string) => void;
    readonly bookmarkPreviewLimit: string;
    readonly setBookmarkPreviewLimit: (value: string) => void;
    readonly fileSavingDirectory: string;
    readonly setFileSavingDirectory: (value: string) => void;
    readonly defaultDirectory: string;
    readonly setDefaultDirectory: (value: string) => void;
    readonly automaticFileSave: string;
    readonly setAutomaticFileSave: (value: string) => void;
    readonly onSelectDirectory: () => void;
    readonly criterionLanguage: string;
    readonly setCriterionLanguage: (value: string) => void;
    readonly dateFormat: string;
    readonly setDateFormatHandler: (value: string) => void;
    readonly timeFormat: string;
    readonly setTimeFormatHandler: (value: string) => void;
    readonly isLoggedIn: boolean;
    readonly isLoadingProfile: boolean;
    readonly accountEmail: string;
    readonly onChangePassword: () => void;
    readonly onDeleteAccount: (password: string) => void;
    readonly accountControl: Control<AccountProfileFormData>;
    readonly accountErrors: FieldErrors<AccountProfileFormData>;
    readonly watchedKeywords: string[];
    readonly onLogin: () => void;
}

export function getPreferencesSectionContent({
    activeSection,
    t,
    fileNameDisplay,
    setFileNameDisplay,
    rememberLayout,
    setRememberLayout,
    pdfQuality,
    setPdfQuality,
    recentFilesCount,
    setRecentFilesCount,
    selectedTheme,
    setSelectedTheme,
    commentPreviewLimit,
    setCommentPreviewLimit,
    bookmarkPreviewLimit,
    setBookmarkPreviewLimit,
    fileSavingDirectory,
    setFileSavingDirectory,
    defaultDirectory,
    setDefaultDirectory,
    automaticFileSave,
    setAutomaticFileSave,
    onSelectDirectory,
    criterionLanguage,
    setCriterionLanguage,
    dateFormat,
    setDateFormatHandler,
    timeFormat,
    setTimeFormatHandler,
    isLoggedIn,
    isLoadingProfile,
    accountEmail,
    onChangePassword,
    onDeleteAccount,
    accountControl,
    accountErrors,
    watchedKeywords,
    onLogin,
}: PreferencesSectionContentProps): ReactElement {
    const generalSection = (
        <PreferencesGeneralSection
            t={t}
            fileNameDisplay={fileNameDisplay}
            setFileNameDisplay={setFileNameDisplay}
            rememberLayout={rememberLayout}
            setRememberLayout={setRememberLayout}
            pdfQuality={pdfQuality}
            setPdfQuality={setPdfQuality}
            recentFilesCount={recentFilesCount}
            setRecentFilesCount={setRecentFilesCount}
        />
    );

    switch (activeSection) {
        case "general":
            return generalSection;
        case "appearance":
            return (
                <PreferencesAppearanceSection
                    t={t}
                    selectedTheme={selectedTheme}
                    setSelectedTheme={setSelectedTheme}
                    commentPreviewLimit={commentPreviewLimit}
                    setCommentPreviewLimit={setCommentPreviewLimit}
                    bookmarkPreviewLimit={bookmarkPreviewLimit}
                    setBookmarkPreviewLimit={setBookmarkPreviewLimit}
                />
            );
        case "file":
            return (
                <PreferencesFileSection
                    t={t}
                    fileSavingDirectory={fileSavingDirectory}
                    setFileSavingDirectory={setFileSavingDirectory}
                    defaultDirectory={defaultDirectory}
                    setDefaultDirectory={setDefaultDirectory}
                    automaticFileSave={automaticFileSave}
                    setAutomaticFileSave={setAutomaticFileSave}
                    onSelectDirectory={onSelectDirectory}
                />
            );
        case "language":
            return (
                <PreferencesLanguageSection
                    t={t}
                    criterionLanguage={criterionLanguage}
                    setCriterionLanguage={setCriterionLanguage}
                    dateFormat={dateFormat}
                    setDateFormatHandler={setDateFormatHandler}
                    timeFormat={timeFormat}
                    setTimeFormatHandler={setTimeFormatHandler}
                />
            );
        case "editing":
            return <div className="p-4"></div>;
        case "account":
            return (
                <PreferencesAccountSection
                    t={t}
                    isLoggedIn={isLoggedIn}
                    isLoadingProfile={isLoadingProfile}
                    accountEmail={accountEmail}
                    onChangePassword={onChangePassword}
                    onDeleteAccount={onDeleteAccount}
                    accountControl={accountControl}
                    accountErrors={accountErrors}
                    watchedKeywords={watchedKeywords}
                    onLogin={onLogin}
                />
            );
        default:
            return generalSection;
    }
}
