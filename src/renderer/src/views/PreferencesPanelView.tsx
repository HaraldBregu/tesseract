import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import Button from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { ThemeProvider, useTheme } from "../providers/theme-provider";
import { timeFormatOptions } from "@/utils/utils";
import { useElectron } from "@/hooks/use-electron";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordDialog } from "./components/preferences/preferences-change-password-dialog";
import { getPreferencesSectionContent } from "./components/preferences/preferences-section-content";
import { AccountProfileFormData, createAccountProfileSchema } from "@/utils/accountProfileSchema";

interface PreferencesPanelViewProps {
    account?: boolean;
}

function getAccountFlag(search: string): boolean {
    const params = new URLSearchParams(search);
    return params.get("account") === "1" || params.get("account") === "true";
}

const PreferencesPanelView = ({ account = false }: PreferencesPanelViewProps) => {
    const { t, i18n } = useTranslation();
    const { setTheme } = useTheme();
    const electron = useElectron();

    // Convert all constants to functions that accept t as parameter
    const sidebarItems = useMemo(() => {
        const items = [
            { id: "general", label: t("preferences.sections.general") },
            { id: "appearance", label: t("preferences.sections.appearance") },
            { id: "file", label: t("preferences.sections.file") },
            { id: "language", label: t("preferences.sections.language") },
            { id: "account", label: t("preferences.sections.account") }
        ];

        return items;
    }, [t]);

    // Notify main process when component is mounted and ready to show
    useEffect(() => {
        globalThis.electron.ipcRenderer.send("child-window-ready");
    }, []);

    const [activeSection, setActiveSection] = useState(account ? "account" : "general");
    const [fileNameDisplay, setFileNameDisplay] = useState<"full" | "filename">(
        "full"
    );
    const [rememberLayout, setRememberLayout] = useState(true);
    const [pdfQuality, setPdfQuality] = useState("4");
    const [recentFilesCount, setRecentFilesCount] = useState(10);
    const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("light");
    const [commentPreviewLimit, setCommentPreviewLimit] = useState("20");
    const [bookmarkPreviewLimit, setBookmarkPreviewLimit] = useState("20");
    const [fileSavingDirectory, setFileSavingDirectory] = useState("last");
    const [defaultDirectory, setDefaultDirectory] =
        useState("~/Select/your/path");
    const [automaticFileSave, setAutomaticFileSave] = useState("never");
    const [versioningDirectory, setVersioningDirectory] = useState("default");
    const [customVersioningDirectory, setCustomVersioningDirectory] =
        useState("~/Select/your/path");
    const [criterionLanguage, setCriterionLanguage] = useState("en");
    const [criterionRegion, setCriterionRegion] = useState("IT");
    const [dateFormat, setDateFormat] = useState("yyyy/MM/dd");
    const [timeFormat, setTimeFormat] = useState("HH:MM");

    const [historyActionsCount, setHistoryActionsCount] = useState("10");

    useEffect(() => {
        if (account) {
            setActiveSection("account");
        }
    }, [account]);

    // Account section state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [accountEmail, setAccountEmail] = useState("");
    const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [hasAccountSaveError, setHasAccountSaveError] = useState(false);
    const accountProfileSchema = useMemo(
        () => createAccountProfileSchema(t),
        [t]
    );
    const {
        control: accountControl,
        handleSubmit: handleAccountSubmit,
        formState: { errors: accountErrors, isDirty: isAccountDirty, isValid: isAccountValid },
        reset: resetAccountForm,
        watch: watchAccount,
    } = useForm<AccountProfileFormData>({
        resolver: zodResolver(accountProfileSchema),
        defaultValues: {
            name: "",
            surname: "",
            institution: "",
            keywords: [],
        },
        mode: "onChange",
    });

    const watchedKeywords = watchAccount("keywords") ?? [];

    useEffect(() => {
        const subscription = watchAccount(() => {
            setHasAccountSaveError(false);
        });

        return () => subscription.unsubscribe();
    }, [watchAccount]);

    const hasAccountValidationErrors =
        isLoggedIn && ((isAccountDirty && !isAccountValid) || hasAccountSaveError);

    const setDateFormatHandler = useCallback((value: string) => {
        setDateFormat(value);
    }, []);

    const setTimeFormatHandler = useCallback((value: string) => {
        setTimeFormat(value);
    }, []);

    const handleChangePassword = useCallback(() => {
        setIsChangePasswordDialogOpen(true);
    }, []);

    const handleDeleteAccount = useCallback((password: string) => {
        window.user
            .deleteCurrentUser(password)
            .then(async (result) => {
                switch (result.success) {
                    case false: {
                        const resultError = result.error
                        const errorType = resultError.type
                        switch (errorType) {
                            case "INVALID_CREDENTIALS":
                                toast.error(t("share.error"), {
                                    description: t("Error password")
                                });
                                break;
                            case "USER_NOT_FOUND":
                                toast.error(t("share.error"), {
                                    description: t("user not found")
                                });
                                break;
                            case "INVALID_OPERATION":
                                toast.error(t("share.error"), {
                                    description: t("invalid operation")
                                });
                                break;
                            case "UNKNOWN_ERROR":
                            default:
                                toast.error(t("share.error"), {
                                    description: t("share.errors.unknownError")
                                });
                                break;
                        }
                        break;
                    }
                    case true: {
                        await globalThis.user.logout();
                        globalThis.electron.ipcRenderer.send("update-auth-status",);
                        setIsLoggedIn(false);
                        toast.success(t("preferences.account.deleteSuccess"));
                        break;
                    }
                }
            })
            .catch(() => {
                toast.error(t("preferences.account.deleteError"));
            })
    }, []);

    useEffect(() => {
        const loadPreferences = async () => {
            const preferences = await window.preferences.getPreferences();
            if (preferences.fileNameDisplay) {
                setFileNameDisplay(preferences.fileNameDisplay);
            }
            if (preferences.rememberLayout !== undefined) {
                setRememberLayout(preferences.rememberLayout);
            }
            if (preferences.pdfQuality !== undefined) {
                setPdfQuality(preferences.pdfQuality);
            }
            if (preferences.recentFilesCount !== undefined) {
                setRecentFilesCount(preferences.recentFilesCount);
            }
            if (preferences.theme !== undefined && preferences.theme !== 'system') {
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
            if (preferences.dateFormat !== undefined) {
                // Parse the combined dateTimeFormat to extract date and time separately
                const parts = preferences.dateFormat.split(' ');
                if (parts.length >= 2) {
                    setDateFormat(parts[0]);
                    const timePart = parts.slice(1).join(' ');
                    const supportedTimeFormats = timeFormatOptions.map(option => option.value);
                    const timeFormat = supportedTimeFormats.includes(timePart) ? timePart : 'HH:mm:ss';
                    setTimeFormat(timeFormat);
                }
            }
            if (preferences.historyActionsCount !== undefined) {
                setHistoryActionsCount(preferences.historyActionsCount);
            }
        };

        loadPreferences();
    }, [electron.preferences]);

    // Load user account data
    useEffect(() => {
        const loadAccountData = async () => {
            const loggedIn = await globalThis.user.loggedIn() as boolean;
            setIsLoggedIn(loggedIn);

            if (!loggedIn)
                return

            setIsLoadingProfile(true);
            const user = await globalThis.user.currentUser() as User | null;
            if (!user)
                return

            setAccountEmail(user.email);
            resetAccountForm({
                name: user.firstname,
                surname: user.lastname,
                institution: user.institution,
                keywords: user.keywords,
            });
            setIsLoadingProfile(false);
        };

        loadAccountData();
    }, [resetAccountForm]);

    useEffect(() => {
        const syncLanguage = async () => {
            try {
                const preferences = await electron.preferences.getPreferences();
                const currentLang = preferences.criterionLanguage;

                if (currentLang && currentLang !== i18n.language) {
                    i18n.changeLanguage(currentLang);
                    localStorage.setItem("appLanguage", currentLang);
                }

                const savedLanguage = localStorage.getItem("appLanguage");
                if (!currentLang && savedLanguage && savedLanguage !== i18n.language) {
                    i18n.changeLanguage(savedLanguage);
                }
            } catch (error) {
                const savedLanguage = localStorage.getItem("appLanguage");
                if (savedLanguage && savedLanguage !== i18n.language) {
                    i18n.changeLanguage(savedLanguage);
                }
            }
        };

        syncLanguage();

        let removeIpcListener: (() => void) | undefined;
        if (electron.electron?.ipcRenderer) {
            removeIpcListener = electron.electron.ipcRenderer.on(
                "language-changed",
                (_: unknown, lang: string) => {
                    i18n.changeLanguage(lang);
                    localStorage.setItem("appLanguage", lang);
                }
            );
        }

        return () => {
            if (removeIpcListener) {
                removeIpcListener();
            }
        };
    }, [electron.electron, electron.preferences, i18n]);

    const handleSave = useCallback(async () => {
        const preferences: Preferences = {
            fileNameDisplay,
            rememberLayout,
            pdfQuality,
            recentFilesCount,
            theme: selectedTheme,
            commentPreviewLimit,
            bookmarkPreviewLimit,
            fileSavingDirectory,
            defaultDirectory,
            automaticFileSave,
            versioningDirectory,
            customVersioningDirectory,
            criterionLanguage,
            criterionRegion,
            dateFormat: dateFormat + " " + timeFormat,
            historyActionsCount,
        };

        await electron.preferences.savePreferences(preferences);
        setTheme(selectedTheme);
    }, [
        fileNameDisplay,
        rememberLayout,
        pdfQuality,
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
        dateFormat,
        timeFormat,
        historyActionsCount,
        setTheme,
        electron.preferences,
        electron.application,
    ]);

    const handleSaveAll = useCallback(async () => {
        const shouldUpdateProfile = isLoggedIn && isAccountDirty;

        if (shouldUpdateProfile && !isAccountValid) {
            const firstErrorMessage = Object.values(accountErrors)
                .map((error) => {
                    if (!error) return undefined;
                    if (typeof error.message === 'string') return error.message;

                    const maybeKeywordError = (error as unknown as { message?: unknown }[])[0];
                    if (maybeKeywordError && typeof maybeKeywordError?.message === 'string') {
                        return maybeKeywordError.message;
                    }

                    return undefined;
                })
                .find(Boolean);

            toast.error(t('preferences.account.saveError'), {
                description: firstErrorMessage,
            });
            return;
        }

        try {
            setIsSavingAll(true);

            let didSavePreferences = true;
            let didUpdateProfile = !shouldUpdateProfile;

            // Save preferences (local) even if profile update fails.
            try {
                await handleSave();
            } catch (error) {
                console.error("Error saving preferences:", error);
                didSavePreferences = false;
            }

            if (shouldUpdateProfile) {
                const submit = handleAccountSubmit(async (data) => {
                    const institution = data.institution?.trim()
                        ? data.institution.trim()
                        : undefined;
                    const keywords = data.keywords.length > 0 ? data.keywords : undefined;

                    try {
                        const response = await globalThis.user.updateUser({
                            userName: data.name,
                            userSurname: data.surname,
                            userInstitution: institution,
                            userKeywords: keywords,
                        });

                        console.log("Update user response:", response);

                        if (response.success) {
                            didUpdateProfile = true;
                            setHasAccountSaveError(false);
                        } else {
                            const errorType = response.error.type;
                            switch (errorType) {
                                case "UNAUTHORIZED":
                                    toast.error(t("preferences.account.saveError"), {
                                        description: t("auth.signIn.errorToastCredentialsDescription"),
                                    });
                                    break;
                                case "INVALID_INPUT_DATA":
                                    toast.error(t("preferences.account.saveError"), {
                                        description: t("auth.signUp.errorToastInvalidDataDescription"),
                                    });
                                    break;
                                case "USER_NOT_FOUND":
                                    toast.error(t("preferences.account.saveError"), {
                                        description: t("auth.signIn.errorToastUserNotFoundDescription"),
                                    });
                                    break;
                                case "UNKNOWN_ERROR":
                                default:
                                    toast.error(t("preferences.account.saveError"), {
                                        description: t("auth.signIn.errorToastUnknownDescription"),
                                    });
                                    break;
                            }
                            setHasAccountSaveError(true);
                            didUpdateProfile = false;
                        }
                    } catch {
                        setHasAccountSaveError(true);
                        didUpdateProfile = false;
                        toast.error(t("preferences.account.saveError"), {
                            description: t("auth.signIn.errorToastUnknownDescription"),
                        });
                    }
                });

                try {
                    await submit();
                } catch (error) {
                    console.error("Error updating user profile:", error);
                    setHasAccountSaveError(true);
                    didUpdateProfile = false;
                }
            }

            if (!didSavePreferences) toast.error(t("preferences.save.error"));
            if (!didUpdateProfile) toast.error(t("preferences.account.saveError"));

            if (didSavePreferences && didUpdateProfile) {
                if (shouldUpdateProfile) {
                    toast.success(t("preferences.account.saveSuccess"));
                } else {
                    toast.success(t("preferences.save.success"));
                }
            }
        } finally {
            setIsSavingAll(false);
        }
    }, [
        electron.application,
        handleAccountSubmit,
        handleSave,
        accountErrors,
        isAccountDirty,
        isAccountValid,
        isLoggedIn,
        t,
    ]);

    const handleReset = useCallback(() => {
        setFileNameDisplay("full");
        setRememberLayout(true);
        setPdfQuality("4");
        setRecentFilesCount(10);
        setSelectedTheme('light');
        setCommentPreviewLimit('50');
        setBookmarkPreviewLimit('50');
        setFileSavingDirectory('last');
        setDefaultDirectory('~/Select/your/path/');
        setAutomaticFileSave('never');
        setVersioningDirectory('default');
        setCustomVersioningDirectory('~/Select/your/path/');
        setCriterionLanguage('en');
        setCriterionRegion('IT');
        setDateFormat('yyyy/MM/dd');
        setTimeFormat('HH:mm:ss');
        setHistoryActionsCount('10');
    }, []);

    // Handler per aprire il dialog di selezione cartella
    const handleSelectDirectory = useCallback(() => {
        const ipcRenderer = electron.electron.ipcRenderer;

        ipcRenderer.send("select-folder-path");

        const removeListener = ipcRenderer.on(
            "receive-folder-path",
            (_: unknown, path?: string) => {
                if (path && path.length > 0) setDefaultDirectory(path);
                removeListener();
            }
        );
    }, [electron.electron]);

    const handleLogin = useCallback(() => {
        globalThis.electron.ipcRenderer.send("open-auth-from-preferences");
    }, []);

    const renderContent = () => {
        return getPreferencesSectionContent({
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
            onSelectDirectory: handleSelectDirectory,
            criterionLanguage,
            setCriterionLanguage,
            dateFormat,
            setDateFormatHandler,
            timeFormat,
            setTimeFormatHandler,
            isLoggedIn,
            isLoadingProfile,
            accountEmail,
            onChangePassword: handleChangePassword,
            onDeleteAccount: handleDeleteAccount,
            accountControl,
            accountErrors,
            watchedKeywords,
            onLogin: handleLogin,
        });
    };

    return (
        <div className="fixed inset-0">
            {/* Change Password Dialog */}
            <ChangePasswordDialog
                isOpen={isChangePasswordDialogOpen}
                onOpenChange={setIsChangePasswordDialogOpen}
                accountName={watchAccount("name") || ""}
                accountSurname={watchAccount("surname") || ""}
                accountEmail={accountEmail}
                t={t}
            />

            {/* Main Content Area with explicit height calculation */}
            <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
                <SidebarProvider
                    defaultOpen={true}
                    style={{ height: "calc(100vh - 3.5rem)" }}
                >
                    <Sidebar
                        collapsible="none"
                        style={{ height: "calc(100vh - 3.5rem)" }}
                        className="border-t border-grey-70 dark:border-grey-40"
                    >
                        <SidebarContent style={{ height: "calc(100vh - 3.5rem)" }}>
                            <div className="h-full bg-grey-90 dark:bg-grey-20 border-r">
                                <div className="p-2 h-full overflow-y-auto">
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className={`
                                                    w-full text-left px-3 py-2 text-sm cursor-pointer rounded mb-1
                                                    ${activeSection === item.id
                                                    ? "bg-primary-50 text-white font-medium"
                                                    : "text-grey-10 dark:text-grey-90 hover:bg-gray-100 hover:dark:bg-grey-30"
                                                }`}
                                            onClick={() => setActiveSection(item.id)}
                                        >
                                            {item.label}
                                            {item.id === "account" && hasAccountValidationErrors && (
                                                <span
                                                    className={`ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none ${activeSection === item.id
                                                        ? "border-white text-white"
                                                        : "border-destructive text-destructive"
                                                        }`}
                                                    aria-label={t("preferences.account.saveError")}
                                                    title={t("preferences.account.saveError")}
                                                >
                                                    !
                                                </span>
                                            )}
                                            {activeSection === item.id ? (
                                                <span className="float-right text-grey-80">›</span>
                                            ) : (
                                                <span className="float-right text-grey-60">›</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </SidebarContent>
                    </Sidebar>
                    <SidebarInset
                        style={{ height: "calc(100vh - 3.5rem)" }}
                        className="flex flex-col "
                    >
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
                        size="mini"
                        intent="secondary"
                        variant="tonal"
                        onClick={async () => await electron.application.closeChildWindow()}
                    >
                        {t("preferences.buttons.cancel")}
                    </Button>
                    {activeSection !== "account" && <Button
                        key="reset"
                        size="mini"
                        intent="primary"
                        variant="tonal"
                        onClick={handleReset}
                    >
                        {t("preferences.buttons.resetToDefault")}
                    </Button>}
                    <Button
                        key="ok"
                        size="mini"
                        intent="primary"
                        onClick={handleSaveAll}
                        disabled={isSavingAll || (isLoggedIn && isAccountDirty && !isAccountValid)}
                    >
                        {isSavingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("buttons.save")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const PreferencesPanelViewWithTheme = ({ account }: PreferencesPanelViewProps) => {
    const location = useLocation();
    const accountFromQuery = getAccountFlag(location.search);
    const resolvedAccount = account ?? accountFromQuery;

    return (
        <ThemeProvider>
            <PreferencesPanelView account={resolvedAccount} />
            <Toaster closeButton position="top-right" richColors />
        </ThemeProvider>
    );
};

export default PreferencesPanelViewWithTheme;
