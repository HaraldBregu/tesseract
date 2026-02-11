import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import AppInput from "@/components/app/app-input";
import AppLabel from "@/components/app/app-label";
import {
    AppDialog,
    AppDialogContent,
    AppDialogHeader,
    AppDialogTitle,
} from "@/components/app/app-dialog";
import { createPasswordSchema } from "@/utils/utils";

interface ChangePasswordDialogProps {
    readonly isOpen: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly accountName: string;
    readonly accountSurname: string;
    readonly accountEmail: string;
    readonly t: (key: string) => string;
}

export function ChangePasswordDialog({
    isOpen,
    onOpenChange,
    accountName,
    accountSurname,
    accountEmail,
    t,
}: ChangePasswordDialogProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordSchema = createPasswordSchema(t);
    const changePasswordSchema = z
        .object({
            currentPassword: z.string().min(1, t("auth.validation.passwordRequired")),
            newPassword: passwordSchema,
            confirmPassword: z
                .string()
                .min(1, t("auth.validation.confirmPasswordRequired")),
        })
        .refine((data) => data.currentPassword !== data.newPassword, {
            message: t("auth.validation.passwordDifferent"),
            path: ["newPassword"],
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: t("auth.validation.passwordsMismatch"),
            path: ["confirmPassword"],
        });

    type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        reset,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    function getErrorMessage(errorType: string): string {
        switch (errorType) {
            case "UNAUTHORIZED":
                return t("preferences.account.changePasswordDialog.errorUnauthorized");
            case "USER_NOT_FOUND":
                return t("preferences.account.changePasswordDialog.errorUserNotFound");
            case "MAXIMUM_REQUESTS_REACHED":
                return t("preferences.account.changePasswordDialog.errorMaxRequests");
            case "INVALID_INPUT_DATA":
                return t("preferences.account.changePasswordDialog.errorInvalidInput");
            default:
                return t("preferences.account.changePasswordDialog.errorUnknown");
        }
    }

    async function onSubmit(data: ChangePasswordFormData) {
        try {
            const result = await window.user.changePassword({
                oldPassword: data.currentPassword,
                newPassword: data.newPassword,
            });

            if (result.success) {
                toast.success(t("preferences.account.changePasswordDialog.success"), {
                    description: `${t("preferences.account.changePasswordDialog.successDescription")} ${t("preferences.account.changePasswordDialog.logoutNotice")}`,
                });
                setTimeout(async () => {
                    await globalThis.user.logout();
                    onOpenChange(false);
                    reset();
                    globalThis.electron.ipcRenderer.send("open-auth-from-preferences");
                }, 2000);

            } else {
                const errorMessage = getErrorMessage(result.error?.type ?? "UNKNOWN_ERROR");
                toast.error(t("preferences.account.changePasswordDialog.error"), {
                    description: errorMessage,
                });
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(t("preferences.account.changePasswordDialog.error"), {
                description: t("preferences.account.changePasswordDialog.errorUnknown"),
            });
        }
    }

    return (
        <AppDialog open={isOpen} onOpenChange={onOpenChange}>
            <AppDialogContent className="sm:max-w-md">
                <AppDialogHeader>
                    <AppDialogTitle>{t("preferences.account.changePassword")}</AppDialogTitle>
                </AppDialogHeader>

                <div className="px-5 py-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Read-only fields */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <AppLabel htmlFor="dialog-name" className="text-xs">
                                    {t("preferences.account.name")}
                                </AppLabel>
                                <AppInput
                                    id="dialog-name"
                                    type="text"
                                    value={accountName}
                                    disabled
                                    className="bg-grey-90 dark:bg-grey-20 h-9 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <AppLabel htmlFor="dialog-surname" className="text-xs">
                                    {t("preferences.account.surname")}
                                </AppLabel>
                                <AppInput
                                    id="dialog-surname"
                                    type="text"
                                    value={accountSurname}
                                    disabled
                                    className="bg-grey-90 dark:bg-grey-20 h-9 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <AppLabel htmlFor="dialog-email" className="text-xs">
                                {t("preferences.account.email")}
                            </AppLabel>
                            <AppInput
                                id="dialog-email"
                                type="email"
                                value={accountEmail}
                                disabled
                                className="bg-grey-90 dark:bg-grey-20 h-9 text-sm"
                            />
                        </div>

                        {/* Current Password */}
                        <div className="space-y-2">
                            <AppLabel htmlFor="current-password" className="text-xs">
                                {t("preferences.account.changePasswordDialog.currentPassword")} <span className="text-destructive">*</span>
                            </AppLabel>
                            <div className="relative">
                                <AppInput
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder={t("preferences.account.changePasswordDialog.currentPasswordPlaceholder")}
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
                                    className="h-9 text-sm pr-10"
                                    {...register("currentPassword")}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-xs text-destructive">
                                    {errors.currentPassword.message}
                                </p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <AppLabel htmlFor="new-password" className="text-xs">
                                {t("preferences.account.changePasswordDialog.newPassword")} <span className="text-destructive">*</span>
                            </AppLabel>
                            <div className="relative">
                                <AppInput
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder={t("auth.signUp.passwordPlaceholder")}
                                    autoComplete="new-password"
                                    disabled={isSubmitting}
                                    className="h-9 text-sm pr-10"
                                    {...register("newPassword")}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-xs text-destructive">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <AppLabel htmlFor="confirm-new-password" className="text-xs">
                                {t("preferences.account.changePasswordDialog.confirmPassword")} <span className="text-destructive">*</span>
                            </AppLabel>
                            <div className="relative">
                                <AppInput
                                    id="confirm-new-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={t("auth.signUp.confirmPasswordPlaceholder")}
                                    autoComplete="new-password"
                                    disabled={isSubmitting}
                                    className="h-9 text-sm pr-10"
                                    {...register("confirmPassword")}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-destructive">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                size="mini"
                                intent="secondary"
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    reset();
                                }}
                                disabled={isSubmitting}
                            >
                                {t("preferences.buttons.cancel")}
                            </Button>
                            <Button type="submit" size="mini" intent="primary" disabled={isSubmitting || !isValid}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? t("preferences.account.changePasswordDialog.submitting") : t("preferences.account.changePasswordDialog.submit")}
                            </Button>
                        </div>
                    </form>
                </div>
            </AppDialogContent>
        </AppDialog>
    );
}
