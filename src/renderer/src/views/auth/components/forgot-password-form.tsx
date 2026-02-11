import AppButton from "@/components/app/app-button";
import AppInput from "@/components/app/app-input";
import AppLabel from "@/components/app/app-label";
import { isDev } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetworkState } from "@uidotdev/usehooks";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { useAuth } from "../hooks/use-auth";
import { setEmail, setRoute } from "../context";

function createForgotPasswordSchema(t: (key: string) => string) {
    return z.object({
        email: z
            .string()
            .min(1, t("auth.validation.emailRequired"))
            .email(t("auth.validation.emailInvalid")),
    });
}

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export default function ForgotPasswordForm() {
    const { t } = useTranslation();
    const [, action] = useAuth()
    const forgotPasswordSchema = createForgotPasswordSchema(t);
    const [loading, setLoading] = useState(false);
    const { online } = useNetworkState();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: isDev ? {
            email: import.meta.env.VITE_AUTH_EMAIL,
        } : {},
    });

    async function onSubmit(data: ForgotPasswordFormData) {
        setLoading(true);
        window.user.requestResetPassword({
            userEmail: data.email,
        }).then((result) => {
            setLoading(false);
            switch (result.success) {
                case false: {
                    const loginError = result.error
                    const errorType = loginError.type
                    switch (errorType) {
                        case 'INVALID_EMAIL':
                            toast.error(t("auth.forgotPassword.resetError"), {
                                description: t("email is invalid"),
                            });
                            break;
                        case "USER_NOT_FOUND":
                            toast.error(t("auth.forgotPassword.resetError"), {
                                description: t("user not found"),
                            });
                            break;
                        case 'MAXIMUM_REQUESTS_REACHED':
                            toast.error(t("auth.forgotPassword.resetError"), {
                                description: t(`Maximum requests reached`),
                            });
                            break;
                        case "UNKNOWN_ERROR":
                        default:
                            toast.error(t("auth.signIn.loginError"), {
                                description: t("unknown error occurred"),
                            });
                            break;
                    }
                    break;
                }
                case true: {
                    toast.success(t("Verification code resent to your email."));
                    action(setEmail(data.email))
                    action(setRoute("FORGOT_PASSWORD_VERIFY_CODE"))
                    break;
                }
            }
        }).catch((error) => {
            setLoading(false);
            console.error("Network error:", error);
        })
    }

    return (
        <div className="space-y-8">
            <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                    action(setRoute("SIGNIN"))
                }}
            >
                <ArrowLeft className="h-4 w-4" />
                {t("auth.forgotPassword.backToSignIn")}
            </button>

            <div className="space-y-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight">{t("auth.forgotPassword.title")}</h1>
                <p className="text-pretty text-muted-foreground">
                    {t("auth.forgotPassword.subtitle")}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <AppLabel htmlFor="reset-email">{t("auth.forgotPassword.email")}</AppLabel>
                    <AppInput
                        id="reset-email"
                        type="email"
                        placeholder={t("auth.forgotPassword.emailPlaceholder")}
                        autoComplete="email"
                        disabled={loading}
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>

                <AppButton type="submit" className="w-full" disabled={loading || !online}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
                </AppButton>
            </form>
        </div>
    );
}
