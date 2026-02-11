import AppButton from "@/components/app/app-button";
import AppInput from "@/components/app/app-input";
import AppLabel from "@/components/app/app-label";
import { createPasswordSchema } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetworkState } from "@uidotdev/usehooks";
import { ArrowLeft, EyeOff, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { setRoute } from "../context";

function createChangePasswordSchema(t: (key: string) => string) {
    const passwordSchema = createPasswordSchema(t);
    return z.object({
        email: z
            .string()
            .min(1, t("auth.validation.emailRequired"))
            .email(t("auth.validation.emailInvalid")),
        newPassword: passwordSchema,
        confirmPassword: z
            .string()
            .min(1, t("auth.validation.confirmPasswordRequired")),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: t("auth.validation.passwordsMismatch"),
        path: ["confirmPassword"],
    });
}


type ChangePasswordFormData = z.infer<ReturnType<typeof createChangePasswordSchema>>;

export default function ForgotPasswordChangePasswordForm() {
    const { t } = useTranslation();
    const [state, action] = useAuth()
    const changePasswordSchema = createChangePasswordSchema(t);
    const { online } = useNetworkState();
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            email: state.email || '',
            newPassword: "",
            confirmPassword: ""
        },
    });

    async function onSubmit(data: ChangePasswordFormData) {
        if (!data.email || !state.code)
            return

        window.user.resetPassword({
            email: data.email,
            resetCode: state.code,
            newPassword: data.newPassword,
        }).then((result) => {
            if (result.success) {
                action(setRoute("FORGOT_PASSWORD_CHANGE_PASSWORD_SUCCESS"))
            } else {
                switch (result.error.type) {
                    case "EXPIRED_RESET_CODE":
                        toast.error(t("reset code expired"));
                        break;
                    case "INVALID_INPUT_DATA":
                        toast.error(t("auth.signIn.errorToastTitle"), {
                            description: t("auth.signIn.errorToastInputDataDescription"),
                        });
                        break;
                    case "INVALID_OPERATION":
                        toast.error(t("invalid operation"));
                        break;
                    case "USER_NOT_FOUND":
                        toast.error(t("auth.signIn.errorToastTitle"), {
                            description: t("auth.signIn.errorToastUserNotFoundDescription"),
                        });
                        break;
                    case "UNKNOWN_ERROR":
                    default:
                        toast.error(t("auth.signIn.errorToastTitle"), {
                            description: t("auth.signIn.errorToastUnknownDescription"),
                        });
                        break;
                }
            }
        }).catch((error) => {
            setLoading(false);
            console.error("Network error:", error);
        });

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
                {t("auth.verifyCode.backToSignIn")}
            </button>

            <div className="space-y-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight">{t("Change Password")}</h1>
                <p className="text-pretty text-muted-foreground">
                    {t("Enter your email and new password")}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <AppLabel htmlFor="change-email">{t("auth.signIn.email")}</AppLabel>
                        <AppInput
                            id="change-email"
                            type="email"
                            placeholder={t("auth.signIn.emailPlaceholder")}
                            autoComplete="email"
                            disabled={loading}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <AppLabel htmlFor="new-password">
                            {t("New Password")} <span className="text-destructive">{t("auth.required")}</span>
                        </AppLabel>
                        <div className="relative">
                            <AppInput
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
                                placeholder={t("auth.signUp.passwordPlaceholder")}
                                autoComplete="new-password"
                                disabled={loading}
                                {...register("newPassword")}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <AppLabel htmlFor="change-confirm-password">
                            {t("auth.signUp.confirmPassword")} <span className="text-destructive">{t("auth.required")}</span>
                        </AppLabel>
                        <div className="relative">
                            <AppInput
                                id="change-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder={t("auth.signUp.confirmPasswordPlaceholder")}
                                autoComplete="new-password"
                                disabled={loading}
                                {...register("confirmPassword")}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>

                <AppButton type="submit" className="w-full" disabled={loading || !online}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t("auth.signUp.submitting") : t("Change Password")}
                </AppButton>
            </form>
        </div>
    );
}