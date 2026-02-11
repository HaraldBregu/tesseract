import AppButton from "@/components/app/app-button";
import AppInput from "@/components/app/app-input";
import AppLabel from "@/components/app/app-label";
import { InputTags } from "@/components/input-tags";
import { createPasswordSchema } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetworkState } from "@uidotdev/usehooks";
import { EyeOff, Eye, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { setEmail, setRoute } from "../context";

type SignUpFormData = z.infer<ReturnType<typeof createSignUpSchema>>;

function createSignUpSchema(t: (key: string) => string) {
    const passwordSchema = createPasswordSchema(t);
    return z.object({
        name: z
            .string()
            .min(1, t("auth.validation.nameRequired"))
            .min(2, t("auth.validation.nameMin"))
            .max(50, t("auth.validation.nameMax"))
            .regex(/^[\p{L}\s']*$/u, t("auth.validation.nameInvalidChars")),
        surname: z
            .string()
            .min(1, t("auth.validation.surnameRequired"))
            .min(2, t("auth.validation.surnameMin"))
            .max(50, t("auth.validation.surnameMax"))
            .regex(/^[\p{L}\s']*$/u, t("auth.validation.surnameInvalidChars")),
        email: z
            .string()
            .min(1, t("auth.validation.emailRequired"))
            .email(t("auth.validation.emailInvalid")),
        password: passwordSchema,
        confirmPassword: z
            .string()
            .min(1, t("auth.validation.confirmPasswordRequired")),
        institution: z
            .string()
            .max(255, t("auth.validation.institutionMax"))
            .regex(/^[\p{L}\s']*$/u, t("auth.validation.institutionInvalidChars"))
            .optional(),
        keywords: z
            .array(
                z.string()
                    .min(1, t("auth.validation.keywordEmpty"))
                    .max(40, t("auth.validation.keywordMax"))
            )
            .max(8, t("auth.validation.keywordsMax"))
            .refine(
                (keywords) => keywords.join('').length <= 255,
                t("auth.validation.keywordsTotalLength")
            )
            .optional(),
        acceptTerms: z
            .boolean()
            .refine((val) => val === true, t("auth.validation.acceptTermsRequired")),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("auth.validation.passwordsMismatch"),
        path: ["confirmPassword"],
    });
}

export default function SignUpForm() {
    const { t } = useTranslation();
    const [, action] = useAuth();
    const signUpSchema = createSignUpSchema(t);
    const [loading, setLoading] = useState(false);
    const { online } = useNetworkState();
    const [keywords, setKeywords] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: import.meta.env.VITE_AUTH_FIRST_NAME,
            surname: import.meta.env.VITE_AUTH_LAST_NAME,
            email: import.meta.env.VITE_AUTH_EMAIL,
            password: import.meta.env.VITE_AUTH_PASS,
            confirmPassword: import.meta.env.VITE_AUTH_PASS,
            institution: import.meta.env.VITE_AUTH_INSTITUTION,
            keywords: [],
            acceptTerms: false,
        },
    });

    const handleKeywordsChange: React.Dispatch<React.SetStateAction<string[]>> = useCallback((action) => {
        setKeywords((prev) => {
            const newKeywords = typeof action === "function" ? action(prev) : action;
            const limitedKeywords = newKeywords.slice(0, 8);
            setValue("keywords", limitedKeywords);
            return limitedKeywords;
        });
    }, [setValue]);

    async function onSubmit(data: SignUpFormData) {
        setLoading(true);
        globalThis.user.register({
            userName: data.name,
            userSurname: data.surname,
            userInstitution: data.institution,
            userKeywords: data.keywords,
            userEmail: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            policyAccepted: data.acceptTerms,
            passwordMatching: data.password === data.confirmPassword,
        }).then((result) => {
            switch (result.success) {
                case false: {
                    const loginError = result.error
                    const errorType = loginError.type
                    switch (errorType) {
                        case "INVALID_INPUT_DATA":
                            toast.error(t("auth.signUp.errorToastTitle"), {
                                description: t("auth.signUp.errorToastInvalidDataDescription"),
                            });
                            break;
                        case "EMAIL_NOT_VERIFIED":
                            toast.error(t("auth.signUp.errorToastTitle"), {
                                description: t("auth.signUp.errorToastEmailNotVerifiedDescription"),
                            });
                            break;
                        case "EMAIL_ALREADY_EXISTS":
                            toast.error(t("auth.signUp.errorToastTitle"), {
                                description: t("auth.signUp.errorToastEmailAlreadyExistsDescription"),
                            });
                            break;
                        case "UNKNOWN_ERROR":
                        default:
                            toast.error(t("auth.signUp.errorToastTitle"), {
                                description: t("auth.signUp.errorToastUnknownDescription"),
                            });
                            break;
                    }
                    break;
                }
                case true: {
                    action(setEmail(data.email))
                    action(setRoute("ACCOUNT_VERIFICATION"));
                    break;
                }
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            toast.error(t("auth.signUp.errorToastTitle"), {
                description: t("auth.signUp.errorToastServiceDescription"),
            });
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight">{t("auth.signUp.title")}</h1>
                <p className="text-pretty text-muted-foreground">{t("auth.signUp.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-4">
                    {/* Name & Surname Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <AppLabel htmlFor="name">
                                {t("auth.signUp.name")} <span className="text-destructive">{t("auth.required")}</span>
                            </AppLabel>
                            <AppInput
                                id="name"
                                type="text"
                                placeholder={t("auth.signUp.namePlaceholder")}
                                autoComplete="given-name"
                                disabled={loading}
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <AppLabel htmlFor="surname">
                                {t("auth.signUp.surname")} <span className="text-destructive">{t("auth.required")}</span>
                            </AppLabel>
                            <AppInput
                                id="surname"
                                type="text"
                                placeholder={t("auth.signUp.surnamePlaceholder")}
                                autoComplete="family-name"
                                disabled={loading}
                                {...register("surname")}
                            />
                            {errors.surname && (
                                <p className="text-sm text-destructive">{errors.surname.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <AppLabel htmlFor="signup-email">
                            {t("auth.signUp.email")} <span className="text-destructive">{t("auth.required")}</span>
                        </AppLabel>
                        <AppInput
                            id="signup-email"
                            type="email"
                            placeholder={t("auth.signUp.emailPlaceholder")}
                            autoComplete="email"
                            disabled={loading}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <AppLabel htmlFor="signup-password">
                            {t("auth.signUp.password")} <span className="text-destructive">{t("auth.required")}</span>
                        </AppLabel>
                        <div className="relative">
                            <AppInput
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t("auth.signUp.passwordPlaceholder")}
                                autoComplete="new-password"
                                disabled={loading}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <AppLabel htmlFor="confirm-password">
                            {t("auth.signUp.confirmPassword")} <span className="text-destructive">{t("auth.required")}</span>
                        </AppLabel>
                        <div className="relative">
                            <AppInput
                                id="confirm-password"
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

                    {/* Institution */}
                    <div className="space-y-2">
                        <AppLabel htmlFor="institution">{t("auth.signUp.institution")}</AppLabel>
                        <AppInput
                            id="institution"
                            type="text"
                            placeholder={t("auth.signUp.institutionPlaceholder")}
                            autoComplete="organization"
                            disabled={loading}
                            {...register("institution")}
                        />
                        {errors.institution && (
                            <p className="text-sm text-destructive">{errors.institution.message}</p>
                        )}
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                        <AppLabel htmlFor="keywords">{t("auth.signUp.keywords")}</AppLabel>
                        <InputTags
                            id="keywords"
                            placeholder={keywords.length >= 8 ? "" : t("auth.signUp.keywordsPlaceholder")}
                            value={keywords}
                            onChange={handleKeywordsChange}
                            disabled={loading}
                            inputDisabled={keywords.length >= 8}
                        />
                        <p className="text-sm text-muted-foreground">{t("auth.signUp.keywordsCount", { count: keywords.length })}</p>
                    </div>

                    {/* Terms & Privacy */}
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            className="mt-1 h-4 w-4 rounded border-border"
                            disabled={loading}
                            {...register("acceptTerms")}
                        />
                        <label htmlFor="acceptTerms" className="text-sm text-muted-foreground">
                            {t("auth.signUp.acceptTerms")}{" "}
                            <button type="button" className="text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                {t("auth.signUp.termsOfUse")}
                            </button>
                            {" "}{t("auth.signUp.and")}{" "}
                            <button type="button" className="text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                {t("auth.signUp.privacyPolicy")}
                            </button>
                            <span className="text-destructive"> {t("auth.required")}</span>
                        </label>
                    </div>
                    {errors.acceptTerms && (
                        <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
                    )}
                </div>

                <AppButton type="submit" className="w-full" disabled={loading || !online}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t("auth.signUp.submitting") : t("auth.signUp.submit")}
                </AppButton>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                {t("auth.signUp.hasAccount")}{" "}
                <button
                    type="button"
                    className="text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => action(setRoute("SIGNIN"))}>
                    {t("auth.signUp.signIn")}
                </button>
            </p>
        </div>
    );
}