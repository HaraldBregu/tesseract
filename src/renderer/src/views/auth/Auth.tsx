import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "../../providers/theme-provider";
import { AuthProvider } from "./context";
import criterionLogo from "@resources/appIcons/icon.png";
import { useTranslation } from "react-i18next";
import { useNetworkState } from "@uidotdev/usehooks";
import SignUpForm from "./components/signup-form";
import SignInForm from "./components/signin-form";
import ForgotPasswordForm from "./components/forgot-password-form";
import ForgotPasswordVerifyCodeForm from "./components/forgot-password-verify-code-form";
import VerifyEmailForm from "./components/verify-email-form";
import ForgotPasswordChangePasswordForm from "./components/forgot-password-change-password-form";
import VerifyAccountSuccess from "./components/verify-account-success";
import ForgotPasswordChangedPasswordSuccess from "./components/forgot-password-change-password-success";
import { useAuth } from "./hooks/use-auth";

const Auth = () => {
    const { t } = useTranslation();
    const { online } = useNetworkState();
    const [state] = useAuth()

    return (
        <div className="flex min-h-screen overflow-hidden relative">
            {/* Connection Status Banner */}
            {!online && (
                <div className="absolute top-0 left-0 right-0 w-full bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-1 text-center font-medium text-xs z-50">
                    {t("No internet connection")}
                </div>
            )}

            <div className="flex min-h-screen overflow-hidden flex-1 w-full">
                {/* Left Column - Logo & Branding */}
                <div className="hidden md:flex md:w-1/2 md:flex-col md:items-center md:justify-center bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-800">
                    <div className="flex flex-col items-center space-y-8">
                        <div className="flex h-40 w-40 items-center justify-center">
                            <img
                                src={criterionLogo}
                                alt="Criterion Logo"
                                className="h-32 w-32 object-contain drop-shadow-lg rounded-lg shadow-md"
                            />
                        </div>

                        <div className="text-center space-y-3">
                            <h1 className="text-5xl font-bold text-white tracking-tight drop-shadow-md">
                                {t("auth.branding.title")}
                            </h1>
                            <p className="text-lg text-white/80 max-w-sm">
                                {t("auth.branding.subtitle")}
                            </p>
                        </div>

                        <div className="flex gap-2 pt-8">
                            <div className="h-2 w-2 rounded-full bg-white/40"></div>
                            <div className="h-2 w-8 rounded-full bg-white/60"></div>
                            <div className="h-2 w-2 rounded-full bg-white/40"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Auth Forms */}
                <div className="relative w-full md:w-1/2 bg-background dark:bg-grey-10">
                    <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
                        <div className="flex min-h-full items-center justify-center px-4 py-12 md:px-8">
                            <div className="w-full max-w-md">
                                {(() => {
                                    switch (state.currentRoute) {
                                        case "SIGNUP":
                                            return (<SignUpForm />);
                                        case "ACCOUNT_VERIFICATION":
                                            return (<VerifyEmailForm />)
                                        case "ACCOUNT_VERIFICATION_SUCCESS":
                                            return (<VerifyAccountSuccess />);
                                        case "SIGNIN":
                                            return (<SignInForm />)
                                        case "FORGOT_PASSWORD":
                                            return (<ForgotPasswordForm />);
                                        case "FORGOT_PASSWORD_VERIFY_CODE":
                                            return (<ForgotPasswordVerifyCodeForm />);
                                        case "FORGOT_PASSWORD_CHANGE_PASSWORD":
                                            return (<ForgotPasswordChangePasswordForm />);
                                        case "FORGOT_PASSWORD_CHANGE_PASSWORD_SUCCESS":
                                            return (<ForgotPasswordChangedPasswordSuccess />);
                                        default:
                                            return null;
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AuthPage() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Auth />
                <Toaster closeButton position="top-right" richColors />
            </AuthProvider>
        </ThemeProvider>
    );
}
