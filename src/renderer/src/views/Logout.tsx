import AppButton from "@/components/app/app-button";
import { ThemeProvider } from "@/providers/theme-provider";
import criterionLogo from "@resources/appIcons/icon.png";
import { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

const Logout = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState<string>("");

    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const user = await globalThis.user.currentUser();
                if (user?.email) {
                    setUserEmail(user.email);
                }
            } catch (error) {
                console.error("Failed to fetch user email:", error);
            }
        };
        fetchUserEmail();
    }, []);

    const cancel = useCallback(() => {
        globalThis.electron.ipcRenderer.send('close-logout-window');
    }, []);

    const signOut = useCallback(async () => {
        setIsLoading(true);
        try {
            await globalThis.user.logout();
            globalThis.electron.ipcRenderer.send('update-auth-status');
            cancel();
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoading(false);
        }
    }, [cancel]);

    return (
        <div className="min-h-screen bg-background dark:bg-grey-10 flex items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="flex justify-center">
                    <img
                        src={criterionLogo}
                        alt="Criterion Logo"
                        className="h-16 w-16 object-contain rounded-xl shadow-lg"
                    />
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {t("auth.logout.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("auth.logout.subtitle")}
                    </p>
                </div>

                {/* Email */}
                {userEmail && (
                    <p className="text-foreground text-center font-medium text-base">
                        {userEmail}
                    </p>
                )}

                {/* Warning Box */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <p className="text-muted-foreground text-center text-sm">
                        {t("auth.logout.warning")}
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-center pt-2">
                    <AppButton
                        variant="outline"
                        onClick={cancel}
                        disabled={isLoading}
                    >
                        {t("auth.logout.cancel")}
                    </AppButton>
                    <AppButton
                        variant="destructive"
                        onClick={signOut}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? t("auth.logout.submitting") : t("auth.logout.submit")}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default function LogoutPage() {
    return (
        <ThemeProvider>
            <Logout />
        </ThemeProvider>
    );
}
