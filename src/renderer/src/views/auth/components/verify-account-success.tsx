import AppButton from "@/components/app/app-button";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/use-auth";
import { setRoute } from "../context";


export default function VerifyAccountSuccess() {
    const { t } = useTranslation();
    const [, action] = useAuth()

    return (
        <div className="space-y-8 text-center">
            <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight">{t("auth.verificationSuccess.title")}</h1>
                <p className="text-pretty text-muted-foreground">
                    {t("auth.verificationSuccess.subtitle")}
                </p>
            </div>

            <AppButton
                className="w-full"
                onClick={() => action(setRoute("SIGNIN"))}>
                {t("auth.verificationSuccess.continue")}
            </AppButton>
        </div>
    );
}