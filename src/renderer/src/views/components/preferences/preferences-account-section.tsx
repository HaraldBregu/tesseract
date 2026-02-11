import { memo, useState } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import Button from "@/components/ui/button";
import Typography from "@/components/Typography";
import AppSeparator from "@/components/app/app-separator";
import TextField from "@/components/ui/textField";
import { InputTags } from "@/components/input-tags";
import { Info, Loader2 } from "lucide-react";
import {
    AppDialog,
    AppDialogContent,
    AppDialogFooter,
    AppDialogHeader,
    AppDialogTitle,
} from "@/components/app/app-dialog";
import type { AccountProfileFormData } from "../../../utils/accountProfileSchema";
import AppButton from "@/components/app/app-button";
import { Checkbox } from "@/components/ui/checkbox";

interface PreferencesAccountSectionProps {
    readonly t: (key: string) => string;
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

export const PreferencesAccountSection = memo(function PreferencesAccountSection({
    t,
    isLoggedIn,
    isLoadingProfile,
    accountEmail,
    onChangePassword,
    onDeleteAccount,
    accountControl,
    accountErrors,
    watchedKeywords,
    onLogin,
}: PreferencesAccountSectionProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acknowledgeDeletion, setAcknowledgeDeletion] = useState(false);

    const handleDeleteConfirm = async () => {
        if (currentPassword.length === 0 || confirmPassword.length === 0 || !acknowledgeDeletion)
            return

        if (currentPassword !== confirmPassword)
            return

        setIsDeleting(true);
        try {
            await onDeleteAccount(currentPassword);
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                <Typography
                    component="h2"
                    className="text-xl font-semibold text-grey-40 dark:text-grey-70"
                >
                    {t("preferences.account.notLoggedIn")}
                </Typography>
                <Typography component="p" className="text-sm text-grey-50 dark:text-grey-60">
                    {t("preferences.account.loginPrompt")}
                </Typography>
                <Button
                    size="mini"
                    intent="primary"
                    className="mt-4"
                    onClick={onLogin}
                >
                    {t("auth.signIn.submit")}
                </Button>
            </div>
        );
    }

    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-6">
                {/* Email and Change Password */}
                <div className="grid grid-cols-4 gap-4 items-start">
                    <div className="col-span-3">
                        <Typography
                            component="label"
                            className="text-sm font-medium text-grey-30 dark:text-grey-80"
                        >
                            {t("preferences.account.email")}
                        </Typography>
                        <TextField
                            id="account-email"
                            type="email"
                            value={accountEmail}
                            disabled={true}
                            className="bg-grey-90 dark:bg-grey-20 mt-2"
                        />
                        <Typography component="p" className="text-xs text-grey-50 dark:text-grey-60 mt-2">
                            {t("preferences.account.emailCannotBeChanged")}
                        </Typography>
                    </div>
                    <div className="col-span-1 mt-8">
                        <Button
                            size="mini"
                            intent="secondary"
                            variant="outline"
                            onClick={onChangePassword}
                            className="w-full h-8"
                        >
                            {t("preferences.account.changePassword")}
                        </Button>
                    </div>
                </div>

                <AppSeparator />

                {/* Name & Surname Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Typography
                            component="label"
                            className="text-sm font-medium text-grey-30 dark:text-grey-80"
                        >
                            {t("preferences.account.name")} <span className="text-red-500">*</span>
                        </Typography>
                        <Controller
                            name="name"
                            control={accountControl}
                            render={({ field }) => (
                                <TextField
                                    id="account-name"
                                    type="text"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t("preferences.account.namePlaceholder")}
                                />
                            )}
                        />
                        {accountErrors.name && (
                            <p className="text-sm text-destructive">{accountErrors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Typography
                            component="label"
                            className="text-sm font-medium text-grey-30 dark:text-grey-80"
                        >
                            {t("preferences.account.surname")} <span className="text-red-500">*</span>
                        </Typography>
                        <Controller
                            name="surname"
                            control={accountControl}
                            render={({ field }) => (
                                <TextField
                                    id="account-surname"
                                    type="text"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t("preferences.account.surnamePlaceholder")}
                                />
                            )}
                        />
                        {accountErrors.surname && (
                            <p className="text-sm text-destructive">
                                {accountErrors.surname.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Institution */}
                <div className="space-y-2">
                    <Typography
                        component="label"
                        className="text-sm font-medium text-grey-30 dark:text-grey-80"
                    >
                        {t("preferences.account.institution")}
                    </Typography>
                    <Controller
                        name="institution"
                        control={accountControl}
                        render={({ field }) => (
                            <TextField
                                id="account-institution"
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={t("preferences.account.institutionPlaceholder")}
                            />
                        )}
                    />
                    {accountErrors.institution && (
                        <p className="text-sm text-destructive">
                            {accountErrors.institution.message}
                        </p>
                    )}
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                    <Typography
                        component="label"
                        className="text-sm font-medium text-grey-30 dark:text-grey-80"
                    >
                        {t("preferences.account.keywords")}
                    </Typography>
                    <Controller
                        name="keywords"
                        control={accountControl}
                        render={({ field }) => (
                            <InputTags
                                id="account-keywords"
                                placeholder={
                                    (field.value?.length ?? 0) >= 8
                                        ? ""
                                        : t("preferences.account.keywordsPlaceholder")
                                }
                                value={field.value}
                                onChange={(action) => {
                                    const next =
                                        typeof action === "function" ? action(field.value) : action;
                                    field.onChange(next.slice(0, 8));
                                }}
                                chipVariant="secondary"
                            />
                        )}
                    />
                    {accountErrors.keywords && (
                        <p className="text-sm text-destructive">
                            {accountErrors.keywords.message}
                        </p>
                    )}
                    {watchedKeywords.length === 0 && (
                        <Typography component="p" className="text-xs text-grey-50 dark:text-grey-60">
                            {t("preferences.account.keywordsHint")}
                        </Typography>
                    )}
                </div>
            </div>

            {/* Spacer to push delete button to bottom */}
            <div className="flex-1" />

            {/* Delete Account */}
            <div className="flex justify-end pt-4">
                <Button
                    size="mini"
                    intent="destructive"
                    variant="tonal"
                    onClick={() => setIsDeleteDialogOpen(true)}
                >
                    {t("preferences.account.deleteAccount")}
                </Button>
            </div>

            {/* Delete Account Confirmation Dialog */}
            <AppDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AppDialogContent className="sm:max-w-[480px]">
                    <AppDialogHeader>
                        <AppDialogTitle className="text-red-600">
                            {t("preferences.account.deleteAccountDialog.title")}
                        </AppDialogTitle>
                    </AppDialogHeader>
                    <div className="px-5 pb-5 pt-2 space-y-4 text-sm text-grey-40 dark:text-grey-70 flex flex-col max-h-[70vh] overflow-y-auto">
                        <div className="flex items-start gap-3">
                            {/* <AlertTriangle className="h-8 w-8 text-red-600 mt-1" /> */}
                            <div className="space-y-2">
                                <Typography
                                    component="p"
                                    className="text-base font-semibold text-red-600">
                                    {t("Delete account")}?
                                </Typography>
                                <Typography
                                    component="p"
                                    className="text-sm">
                                    {t("preferences.account.deleteAccountDialog.description")}
                                </Typography>
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
                                    <ul className="list-disc space-y-2 pl-5 text-sm">
                                        <li>
                                            <span className="font-semibold text-grey-20 dark:text-grey-80">All your personal data</span> (profile, documents, chat history, notifications) will be <span className="font-semibold text-red-600">permanently and irreversibly deleted</span>.
                                        </li>
                                        <li>
                                            <span className="font-semibold text-grey-20 dark:text-grey-80">All collaborators</span> will receive an automatic notification and will <span className="font-semibold">lose access to shared documents</span>.
                                        </li>
                                        <li>
                                            All pending invitations will be updated to <span className="font-semibold">“Account deleted — No further actions allowed”</span>.
                                        </li>
                                        <li>
                                            Your session will be <span className="font-semibold">immediately terminated</span>.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-grey-40 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-grey-60 flex gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                            <p>
                                This action complies with the European GDPR Regulation (Art. 17 – “right to be forgotten”). All data will be physically erased or rendered irrecoverable within 24 hours.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Typography component="p" className="text-sm font-medium text-grey-30 dark:text-grey-80">
                                To confirm deletion, please enter your current password twice:
                            </Typography>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-grey-30 dark:text-grey-70">
                                    {t("Current Password")} <span className="text-red-500">*</span>
                                </label>
                                <TextField
                                    id="delete-account-current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-grey-30 dark:text-grey-70">
                                    {t("Confirm Password")} <span className="text-red-500">*</span>
                                </label>
                                <TextField
                                    id="delete-account-confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <Checkbox
                                checked={acknowledgeDeletion}
                                onCheckedChange={(val) => setAcknowledgeDeletion(Boolean(val))}
                                label={
                                    <span className="text-sm text-grey-40 dark:text-grey-70">
                                        I understand this action is <span className="font-semibold">irreversible</span> and all my data will be <span className="font-semibold text-red-600">permanently deleted</span>.
                                    </span>
                                }
                            />
                        </div>
                    </div>
                    <AppDialogFooter className="gap-2">
                        <AppButton
                            size="sm"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}>
                            {t("preferences.account.deleteAccountDialog.cancel")}
                        </AppButton>
                        <AppButton
                            size="sm"
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("preferences.account.deleteAccountDialog.confirm")}
                        </AppButton>
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>
        </div>
    );
});
