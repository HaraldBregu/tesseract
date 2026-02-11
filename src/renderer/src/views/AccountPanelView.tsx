import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Mail, Building2, LogOut, LogIn, Loader2, X } from "lucide-react";
import Account from "@/components/icons/Account";
import { AnimatePresence, motion } from "framer-motion";
import Settings from "@/components/icons/Settings";

interface UserData {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    institution: string;
    keywords: string[];
}

interface AccountPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function getInitials(firstname: string, lastname: string): string {
    const nameInitial = firstname.charAt(0).toUpperCase();
    const surnameInitial = lastname.charAt(0).toUpperCase();
    return `${nameInitial}${surnameInitial}`;
}

function stripParenSuffix(value: string): string {
    return value.replace(/\s*\([^)]*\)\s*$/, ":").trim();
}

const LoadingState = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground mt-3">
                {t("common.loading")}
            </p>
        </div>
    );
};

interface LoggedInStateProps {
    user: UserData;
    initials: string;
    onSignOut: () => void;
  onOpenPreferences: () => void;
}

const LoggedInState = ({ user, initials, onSignOut, onOpenPreferences }: LoggedInStateProps) => {
    const { t } = useTranslation();
    return (
      <>
        {/* Header with institution */}
        {/* <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                    {user.institution || t('preferences.account.noInstitution')}
                </span>
            </div> */}

        {/* User info section */}
        <div className="p-4 mt-4">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold leading-none select-none mb-3">
              {initials}
            </div>

            {/* User name */}
            <h3 className="text-sm font-semibold text-foreground mb-0.5">
              {user.firstname} {user.lastname}
            </h3>

            {/* Email */}
            {user.email && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            )}

            {/* Institution */}
            {user.institution && (
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {user.institution}
                </span>
              </div>
            )}

            {/* Keywords */}
            {user.keywords && user.keywords.length > 0 && (
              <div className="mt-3 w-full">
                <p className="text-[10px] font-medium text-muted-foreground mb-3">
                  {stripParenSuffix(t("preferences.account.keywords"))}
                </p>
                <div className="flex flex-wrap justify-center gap-1">
                  {user.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-1.5 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-3 py-3 border-t border-border gap-2 flex flex-col">
          <button
            onClick={onOpenPreferences}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md",
              "text-xs font-medium transition-colors",
              "border border-border hover:bg-accent",
              "text-foreground",
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            {t("preferences.account.settings")}
          </button>
          <button
            onClick={onSignOut}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md",
              "text-xs font-medium transition-colors",
              "border border-border hover:bg-accent",
              "text-foreground",
            )}
          >
            <LogOut className="w-3.5 h-3.5" />
            {t("menu.file.signout")}
          </button>
        </div>
      </>
    );
};

interface NotLoggedInStateProps {
    onSignIn: () => void;
}

const NotLoggedInState = ({ onSignIn }: NotLoggedInStateProps) => {
    const { t } = useTranslation();
    return (
      <div className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-muted mb-3">
            <Account
              className="w-7 h-7 text-muted-foreground"
              color="currentColor"
            />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">
            {t("preferences.account.notSignedIn")}
          </h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
            {t("preferences.account.signInPrompt")}
          </p>
          <button
            onClick={onSignIn}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md",
              "text-xs font-medium transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <LogIn className="w-3.5 h-3.5" />
            {t("menu.file.signin")}
          </button>
        </div>
      </div>
    );
};

const AccountPanel = ({ open, onOpenChange }: AccountPanelProps) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch user data when panel opens
    useEffect(() => {
        const fetchUserData = async () => {
            if (!open) return;

            setIsLoading(true);
            try {
                const loggedIn = await globalThis.user.loggedIn();
                setIsLoggedIn(loggedIn);

                if (loggedIn) {
                    const currentUser = await globalThis.user.currentUser();
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setIsLoggedIn(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [open]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onOpenChange]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-account-panel]')) {
                onOpenChange(false);
            }
        };

        if (open) {
            // Delay to avoid immediate close on open click
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, onOpenChange]);

    const handleSignIn = useCallback(() => {
        onOpenChange(false);
        globalThis.electron.ipcRenderer.send('open-auth-modal');
    }, [onOpenChange]);

    const handleSignOut = useCallback(async () => {
        try {
            await globalThis.user.logout();
            setUser(null);
            setIsLoggedIn(false);
            onOpenChange(false);
            globalThis.electron.ipcRenderer.send('update-auth-status');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }, [onOpenChange]);

    const handleOpenPreferences = useCallback(() => {
      onOpenChange(false);
      globalThis.application?.openPreferencesWindow?.({ account: true });
    }, [onOpenChange]);

    const initials = user ? getInitials(user.firstname, user.lastname) : '';

    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }
        if (isLoggedIn && user) {
          return (
            <LoggedInState
              user={user}
              initials={initials}
              onSignOut={handleSignOut}
              onOpenPreferences={handleOpenPreferences}
            />
          );
        }
        return <NotLoggedInState onSignIn={handleSignIn} />;
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    data-account-panel
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                        "fixed top-0 right-1 z-50",
                        "w-[260px] rounded-lg shadow-lg",
                        "bg-background border border-border",
                        "overflow-hidden"
                    )}
                >
                    {/* Close button */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className={cn(
                            "absolute top-2 right-2 z-10",
                            "p-1 rounded-md transition-colors",
                            "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                        aria-label="Close"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    {renderContent()}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default memo(AccountPanel);
