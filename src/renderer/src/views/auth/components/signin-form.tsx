import AppButton from "@/components/app/app-button";
import AppInput from "@/components/app/app-input";
import AppLabel from "@/components/app/app-label";
import { AppDispatch } from "@/store/store";
import { selectLoginError, selectLoginLoading, selectLoginSuccess } from "@/views/store/auth/selector";
import { clearLogin, login } from "@/views/store/auth/slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetworkState } from "@uidotdev/usehooks";
import { Eye, EyeOff, Loader2, AlertCircle, Lock } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import z from "zod";
import { useAuth } from "../hooks/use-auth";
import { setEmail, setRoute } from "../context";
import { AppDialog, AppDialogContent, AppDialogHeader, AppDialogTitle, AppDialogFooter } from "@/components/app/app-dialog";

// Schema factory functions to use translated messages
function createLoginSchema(t: (key: string) => string) {
    return z.object({
        email: z
            .string()
            .min(1, t("auth.validation.emailRequired"))
            .email(t("auth.validation.emailInvalid")),
        password: z
            .string()
            .min(1, t("auth.validation.passwordRequired")),
    });
}

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export default function SignInForm() {
    const { t } = useTranslation();
    const [state, action] = useAuth();
    const dispatch = useDispatch<AppDispatch>();
    const loginLoading = useSelector(selectLoginLoading)
    const loginError = useSelector(selectLoginError)
    const loginSuccess = useSelector(selectLoginSuccess)
    const loginSchema = createLoginSchema(t);
    const { online } = useNetworkState();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: import.meta.env.VITE_AUTH_EMAIL,
            password: import.meta.env.VITE_AUTH_PASS,
        },
    });

    const onSubmit = useCallback((data: LoginFormData) => {
        action(setEmail(data.email));
        dispatch(login({
            email: data.email,
            password: data.password,
        }))
    }, [dispatch]);

    useEffect(() => {
        dispatch(clearLogin())
        if (!loginError)
            return;
        switch (loginError) {
            case "INVALID_CREDENTIALS":
                toast.error(t("auth.signIn.errorToastTitle"), {
                    description: t("auth.signIn.errorToastCredentialsDescription"),
                });
                break;
            case "INVALID_INPUT_DATA":
                toast.error(t("auth.signIn.errorToastTitle"), {
                    description: t("auth.signIn.errorToastInputDataDescription"),
                });
                break;
            case "USER_UNVERIFIED":
                setUserNotVerifiedModalIsOpen(true);
                break;
            case "USER_NOT_FOUND":
                toast.error(t("auth.signIn.errorToastTitle"), {
                    description: t("auth.signIn.errorToastUserNotFoundDescription"),
                });
                break;
            case "MAX_ATTEMPTS_REACHED":
                setMaxAttemptsReachedDialogOpen(true)
                break;
            case "UNKNOWN_ERROR":
            default:
                toast.error(t("auth.signIn.errorToastTitle"), {
                    description: t("auth.signIn.errorToastUnknownDescription"),
                });
                break;
        }
    }, [loginError, t])

    useEffect(() => {
        dispatch(clearLogin())
        if (!loginSuccess)
            return;

        toast.success(t("auth.signIn.loginSuccess"), {
            description: t("auth.signIn.loginSuccessDescription"),
        });

        globalThis.electron.ipcRenderer.send('update-auth-status');
        setTimeout(() => {
            globalThis.electron.ipcRenderer.send('close-auth-window');
        }, 1000);

    }, [loginSuccess, t])

    const [userNotVerifiedModalIsOpen, setUserNotVerifiedModalIsOpen] = useState(false);
    const [sendingVerificationCode, setSendingVerificationCode] = useState(false);
    const [maxAttemptsReachedDialogOpen, setMaxAttemptsReachedDialogOpen] = useState(false);

    const sendVerificationCode = useCallback(() => {
        if (!state.email)
            return;

        setSendingVerificationCode(true);
        globalThis.user.sendVerificationCode({
            userEmail: state.email,
        }).then((_result) => {
            setSendingVerificationCode(false);
            setUserNotVerifiedModalIsOpen(false);
            action(setRoute("ACCOUNT_VERIFICATION"));
        }).catch(() => {
            setSendingVerificationCode(false);
            setUserNotVerifiedModalIsOpen(false);
        });
    }, [state.email]);


    return (
        <>
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-balance text-3xl font-semibold tracking-tight">{t("auth.signIn.title")}</h1>
                    <p className="text-pretty text-muted-foreground">{t("auth.signIn.subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <AppLabel htmlFor="email">{t("auth.signIn.email")}</AppLabel>
                            <AppInput
                                id="email"
                                type="email"
                                placeholder={t("auth.signIn.emailPlaceholder")}
                                autoComplete="email"
                                disabled={loginLoading}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <AppLabel htmlFor="password">{t("auth.signIn.password")}</AppLabel>
                                <button
                                    type="button"
                                    className="text-sm text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                    onClick={() => action(setRoute("FORGOT_PASSWORD"))}>
                                    {t("auth.signIn.forgotPassword")}
                                </button>
                            </div>
                            <div className="relative">
                                <AppInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("auth.signIn.passwordPlaceholder")}
                                    autoComplete="current-password"
                                    disabled={loginLoading}
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <AppButton type="submit" className="w-full" disabled={loginLoading || !online}>
                        {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loginLoading ? t("auth.signIn.submitting") : t("auth.signIn.submit")}
                    </AppButton>
                </form>
                <p className="text-center text-sm text-muted-foreground">
                    {t("auth.signIn.noAccount")}{" "}
                    <button
                        type="button"
                        className="text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => action(setRoute("SIGNUP"))}>
                        {t("auth.signIn.signUp")}
                    </button>
                </p>
            </div>

            <AppDialog
                open={userNotVerifiedModalIsOpen}
                onOpenChange={setUserNotVerifiedModalIsOpen}>
                <AppDialogContent className="sm:max-w-md">
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t("auth.userNotVerified.title")}
                        </AppDialogTitle>
                    </AppDialogHeader>
                    <div className="p-6 space-y-6">
                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="text-muted-foreground">
                                {t("auth.userNotVerified.description")}
                            </p>
                            <p className="font-medium text-foreground">
                                {state.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t("auth.userNotVerified.instruction")}
                            </p>
                        </div>
                    </div>
                    <AppDialogFooter className="gap-2 sm:gap-0">
                        <AppButton
                            variant="outline"
                            size="sm"
                            onClick={() => setUserNotVerifiedModalIsOpen(false)}
                            disabled={sendingVerificationCode}>
                            {t("common.cancel")}
                        </AppButton>
                        <AppButton
                            variant="default"
                            size="sm"
                            disabled={sendingVerificationCode}
                            onClick={sendVerificationCode}>
                            {sendingVerificationCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("auth.userNotVerified.verify")}
                        </AppButton>
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>

            <AppDialog
                open={maxAttemptsReachedDialogOpen}
                onOpenChange={setMaxAttemptsReachedDialogOpen}>
                <AppDialogContent className="sm:max-w-md">
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t("Account locked")}
                        </AppDialogTitle>
                    </AppDialogHeader>
                    <div className="p-6 space-y-6">
                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="text-muted-foreground">
                                {t("Account locked")}
                            </p>
                            <p className="font-medium text-foreground">
                                {state.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t("Your account has been temporarily locked for security reasons due to multiple failed login attempts. To regain access, please use the Forgot Password feature.")}
                            </p>
                        </div>
                    </div>
                    <AppDialogFooter className="gap-2 sm:gap-0">
                        <AppButton
                            variant="outline"
                            size="sm"
                            onClick={() => setMaxAttemptsReachedDialogOpen(false)}>
                            {t("common.cancel")}
                        </AppButton>
                        <AppButton
                            variant="default"
                            size="sm"
                            onClick={()=> {
                                action(setRoute("FORGOT_PASSWORD"))
                            }}>
                            {t("Forgot password")}
                        </AppButton>
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>
        </>
    );
}