import { AppSelect, AppSelectTrigger, AppSelectValue, AppSelectContent, AppSelectItem } from "@/components/app/app-select"
import { cn } from "@/lib/utils"
import { t } from "i18next"

interface FilterSelectProps {
    className?: string
    title: string
    placeholder: string
    value: InvitationStatus | "All"
    onChange: (value: InvitationStatus | "All") => void
}
const FilterSelect = ({
    className,
    title,
    placeholder,
    value,
    onChange,
    ...props
}: FilterSelectProps) => {

    return (
        <div className={cn(className)} {...props}>
            <label className="text-xs text-muted-foreground">{t("sharedFiles.invitationStatus")}</label>
            <AppSelect value={value} onValueChange={onChange}>
                <AppSelectTrigger className={cn(
                    "h-8 text-sm",
                    "hover:bg-transparent hover:text-black px-3 py-2"
                )}>
                    <AppSelectValue placeholder={t("sharedFiles.allStatuses")} />
                </AppSelectTrigger>
                <AppSelectContent>
                    <AppSelectItem value="All">{t("sharedFiles.allStatuses")}</AppSelectItem>
                    <AppSelectItem value="Pending">{t("sharedFiles.status.pending")}</AppSelectItem>
                    <AppSelectItem value="Accepted">{t("sharedFiles.status.accepted")}</AppSelectItem>
                    <AppSelectItem value="Declined">{t("sharedFiles.status.declined")}</AppSelectItem>
                    <AppSelectItem value="Expired">{t("sharedFiles.status.expired")}</AppSelectItem>
                    <AppSelectItem value="Revoked">{t("sharedFiles.status.revoked")}</AppSelectItem>
                </AppSelectContent>
            </AppSelect>
        </div>
    )
}

export default FilterSelect;