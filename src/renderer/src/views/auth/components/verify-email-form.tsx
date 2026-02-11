import AppButton from "@/components/app/app-button";
import AppInput from "@/components/app/app-input";
import AppLabel from "@/components/app/app-label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetworkState } from "@uidotdev/usehooks";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { setRoute } from "../context";

function createVerifyCodeSchema(t: (key: string) => string) {
    return z.object({
        code: z
            .string()
            .min(1, t("auth.validation.codeRequired"))
            .length(6, t("auth.validation.codeLength")),
    });
}

type VerifyCodeFormData = z.infer<ReturnType<typeof createVerifyCodeSchema>>;

interface VerifyEmailFormProps {
}

export default function VerifyEmailForm({
}: VerifyEmailFormProps) {
    const { t } = useTranslation();
    const [state, action] = useAuth()
    const verifyCodeSchema = createVerifyCodeSchema(t);
    const [loading, setLoading] = useState(false);
    const { online } = useNetworkState();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<VerifyCodeFormData>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: { code: "" },
    });

    const onBackClick = useCallback(() => {
        switch (state.currentFlow) {
            case "SIGNIN":
                action(setRoute("SIGNIN"))
                break;
            case "SIGNUP":
                action(setRoute("SIGNUP"))
                break;
        }
    }, [action, state.currentFlow]);

    async function onSubmit(data: VerifyCodeFormData) {
        setLoading(true);
        globalThis.user.verifyUser({
            userEmail: state.email,
            code: data.code
        }).then((result) => {
            setLoading(false);
            console.log(result);
            switch (result.success) {
                case false: {
                    const loginError = result.error
                    const errorType = loginError.type
                    switch (errorType) {
                        case "INVALID_CODE":
                            toast.error(t("auth.verifyEmailAccount.errorToastTitle"), {
                                description: t("auth.verifyEmailAccount.errorToastInvalidCodeDescription"),
                            });
                            break;
                        case "INVALID_EMAIL_OR_USER_NOT_FOUND":
                            toast.error(t("auth.verifyEmailAccount.errorToastTitle"), {
                                description: t("auth.verifyEmailAccount.errorToastInvalidDataDescription"),
                            });
                            break;
                        case "USER_NOT_FOUND":
                            toast.error(t("auth.verifyEmailAccount.errorToastTitle"), {
                                description: t("auth.verifyEmailAccount.errorToastUserNotFoundDescription"),
                            });
                            break;
                        case "UNKNOWN_ERROR":
                        default:
                            toast.error(t("auth.verifyEmailAccount.errorToastTitle"), {
                                description: t("auth.verifyEmailAccount.errorToastInvalidCodeDescription"),
                            });
                            break;
                    }
                    break;
                }
                case true: {
                    action(setRoute("ACCOUNT_VERIFICATION_SUCCESS"));
                    break;
                }
            }
        }).catch(() => {
            setLoading(false);
            toast.error(t("auth.verifyEmailAccount.errorToastTitle"), {
                description: t("auth.verifyEmailAccount.errorToastServiceDescription"),
            });
        });
    }

    const resendCode = useCallback(() => {
        globalThis.user.sendVerificationCode({
            userEmail: state.email,
        }).then((result) => {
            switch (result.success) {
                case true: {
                    toast.success(t("Verification code resent to your email."));
                    break;
                }
                case false: {
                    toast.error(t("auth.signIn.loginError"), {
                        description: t("auth.signIn.loginErrorDescription"),
                    });
                    break;
                }
            }
        }).catch(() => {
            toast.error(t("auth.signIn.loginError"), {
                description: t("auth.signIn.loginErrorDescription"),
            });
        });
    }, [state.email, t]);

    return (
        <div className="space-y-8">
            <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={onBackClick}>
                <ArrowLeft className="h-4 w-4" />
                {(() => {
                    switch (state.currentFlow) {
                        case "SIGNIN":
                            return t("auth.verifyEmailAccount.backToSignIn");
                        case "SIGNUP":
                            return t("auth.verifyEmailAccount.backToSignUp");
                    }
                })()}
            </button>

            <div className="space-y-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight">{t("Verify Your Email")}</h1>
                <p className="text-pretty text-muted-foreground">
                    {t("Enter the verification code sent to your email address")}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <AppLabel htmlFor="email-code">{t("auth.verifyEmailAccount.code")}</AppLabel>
                    <AppInput
                        id="email-code"
                        type="text"
                        placeholder={t("auth.verifyEmailAccount.codePlaceholder")}
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
                    {loading ? t("auth.verifyEmailAccount.submitting") : t("Verify Email")}
                </AppButton>

                <p className="text-center text-sm text-muted-foreground">
                    {t("auth.verifyEmailAccount.noCode")}{" "}
                    <button
                        type="button"
                        className="text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={resendCode}
                        disabled={!state.email}>
                        {t("auth.verifyEmailAccount.resend")}
                    </button>
                </p>
            </form>
        </div>
    );
}