import { z } from "zod";

export function createAccountProfileSchema(t: (key: string) => string) {
    const nameRegex = /^[\p{L}\s']*$/u;

    return z.object({
        name: z
            .string()
            .min(1, t("auth.validation.nameRequired"))
            .min(2, t("auth.validation.nameMin"))
            .max(50, t("auth.validation.nameMax"))
            .regex(nameRegex, t("auth.validation.nameInvalidChars")),
        surname: z
            .string()
            .min(1, t("auth.validation.surnameRequired"))
            .min(2, t("auth.validation.surnameMin"))
            .max(50, t("auth.validation.surnameMax"))
            .regex(nameRegex, t("auth.validation.surnameInvalidChars")),
        institution: z
            .string()
            .max(255, t("auth.validation.institutionMax"))
            .regex(/^[\p{L}\s']*$/u, t("auth.validation.institutionInvalidChars"))
            .optional(),
        keywords: z
            .array(
                z
                    .string()
                    .min(1, t("auth.validation.keywordEmpty"))
                    .max(40, t("auth.validation.keywordMax"))
            )
            .max(8, t("auth.validation.keywordsMax"))
            .refine(
                (keywords) => keywords.join("").length <= 255,
                t("auth.validation.keywordsTotalLength")
            ),
    });
}

export type AccountProfileFormData = z.infer<
    ReturnType<typeof createAccountProfileSchema>
>;
