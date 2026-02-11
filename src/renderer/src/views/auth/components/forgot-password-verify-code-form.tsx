import AppButton from "@/components/app/app-button";
import AppInput from "@/components/app/app-input";
import AppLabel from "@/components/app/app-label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetworkState } from "@uidotdev/usehooks";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { useAuth } from "../hooks/use-auth";
import { setCode, setRoute } from "../context";


function createVerifyCodeSchema(t: (key: string) => string) {
    return z.object({
        code: z
            .string()
            .min(1, t("auth.validation.codeRequired"))
            .length(6, t("auth.validation.codeLength")),
    });
}

type VerifyCodeFormData = z.infer<ReturnType<typeof createVerifyCodeSchema>>;

export default function ForgotPasswordVerifyCodeForm() {
    const { t } = useTranslation();
    const verifyCodeSchema = createVerifyCodeSchema(t);
    const { online } = useNetworkState();
    const [loading, setLoading] = useState(false);
    const [state, action] = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<VerifyCodeFormData>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: { code: "" },
    });

    async function onSubmit(data: VerifyCodeFormData) {
        action(setCode(data.code));
        action(setRoute("FORGOT_PASSWORD_CHANGE_PASSWORD"))
    }

    const resendCode = useCallback(() => {
        setLoading(true);
        globalThis.user.requestResetPassword({
            userEmail: state.email,
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
                    break;
                }
            }
        }).catch((error) => {
            setLoading(false);
            console.error("Network error:", error);
        })
    }, [state.email, t]);

    return (
        <div className="space-y-8">
            <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => action(setRoute("SIGNIN"))}>
                <ArrowLeft className="h-4 w-4" />
                {t("auth.verifyCode.backToSignIn")}
            </button>

            <div className="space-y-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight">{t("auth.verifyCode.title")}</h1>
                <p className="text-pretty text-muted-foreground">
                    {t("auth.verifyCode.subtitle")}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <AppLabel htmlFor="code">{t("auth.verifyCode.code")}</AppLabel>
                    <AppInput
                        id="code"
                        type="text"
                        placeholder={t("auth.verifyCode.codePlaceholder")}
                        autoComplete="one-time-code"
                        disabled={loading}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        {...register("code")}
                    />
                    {errors.code && (
                        <p className="text-sm text-destructive">{errors.code.message}</p>
                    )}
                </div>

                <AppButton type="submit" className="w-full" disabled={loading || !online}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t("auth.verifyCode.submitting") : t("auth.verifyCode.submit")}
                </AppButton>

                <p className="text-center text-sm text-muted-foreground">
                    {t("auth.verifyCode.noCode")}{" "}
                    <button
                        type="button"
                        className="text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={resendCode}
                        disabled={!state.email}
                    >
                        {t("auth.verifyCode.resend")}
                    </button>
                </p>
            </form>
        </div>
    );
}