import AppButton from "@/components/app/app-button";
import IconDownload from "@/components/app/icons/IconDownload";
import { Loader2, Check, X } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface InvitationTabRowActionsProps {
    readonly invitation: Invitation;
    readonly onAccept: () => void;
    readonly accepting: boolean;
    readonly onDecline: () => void;
    readonly declining: boolean;
    readonly onDownload: () => void;
    readonly downloading: boolean;
}

export function InvitationTabRowActions({
    invitation,
    onAccept,
    accepting,
    onDecline,
    declining,
    onDownload,
    downloading,
}: InvitationTabRowActionsProps) {
    const { t } = useTranslation();
    const isPending = useMemo(() =>
        invitation.invitationStatus === "Pending", [invitation])
    const isAccepted = useMemo(() =>
        invitation.invitationStatus === "Accepted", [invitation])
    const hasNewVersion = useMemo(() => {
        const lastUpdateDate = invitation.documentDto.lastUpdateDate
        const downloadDate = invitation.downloadDate
        if (!lastUpdateDate || !downloadDate)
            return false

        const lastUpload = new Date(lastUpdateDate)
        return new Date(downloadDate) < lastUpload;
    }, [invitation])

    const alreadyDownloaded = useMemo(() => invitation.alreadyDownloaded, [invitation])

    if (isAccepted && hasNewVersion) {
        return (
            <div className="flex items-center justify-end gap-1">
                <InvitationTabRowUpdateAction
                    onDownload={onDownload}
                    downloading={downloading}
                />
            </div>
        );
    } else if (isAccepted && !hasNewVersion && alreadyDownloaded) {
        return (
            <div className="flex items-center justify-end gap-1">
                {t("sharedFiles.noActionsAvailable")}
            </div>
        );
    } else if (isAccepted && !hasNewVersion) {
        return (
            <div className="flex items-center justify-end gap-1">
                <InvitationTabRowDownloadAction
                    onDownload={onDownload}
                    downloading={downloading}
                />
            </div>
        );
    } else if (isPending) {
        return (
            <div className="flex items-center justify-end gap-2">
                <InvitationTabRowAcceptAction
                    onAccept={onAccept}
                    accepting={accepting}
                />
                <InvitationTabRowDecliningAction
                    onDecline={onDecline}
                    declining={declining}
                />
            </div>
        );
    }

    return (
        <span className="text-sm text-muted-foreground italic">
            {t("sharedFiles.noActionsAvailable")}
        </span>
    );
}

interface InvitationTabRowDownloadActionProps {
    readonly onDownload: () => void;
    readonly downloading: boolean;
}
const InvitationTabRowDownloadAction = ({
    onDownload,
    downloading,
}: InvitationTabRowDownloadActionProps) => {
    const { t } = useTranslation();

    return (
        <AppButton
            variant="success"
            size="sm"
            onClick={onDownload}
            disabled={downloading}>
            {downloading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            {!downloading && <IconDownload />}
            {t("sharedFiles.download")}
        </AppButton>
    )
}

interface InvitationTabRowUpdateActionProps {
    readonly onDownload: () => void;
    readonly downloading: boolean;
}
const InvitationTabRowUpdateAction = ({
    onDownload,
    downloading,
}: InvitationTabRowUpdateActionProps) => {
    const { t } = useTranslation();

    return (
        <AppButton
            variant="success"
            size="sm"
            onClick={onDownload}
            disabled={downloading}>
            {downloading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            {!downloading && <IconDownload className="h-3.5 w-3.5 mr-1" />}
            {t("sharedFiles.downloadNewVersion")}
        </AppButton>
    )
}

interface InvitationTabRowAcceptActionProps {
    readonly onAccept: () => void;
    readonly accepting: boolean;
}
const InvitationTabRowAcceptAction = ({
    onAccept,
    accepting,
}: InvitationTabRowAcceptActionProps) => {
    const { t } = useTranslation();

    return (
        <AppButton
            variant="success"
            size="sm"
            onClick={onAccept}
            disabled={accepting}>
            {accepting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            {!accepting && <Check className="h-3.5 w-3.5 mr-1" />}
            {t("sharedFiles.accept")}
        </AppButton>
    )
}

interface InvitationTabRowDecliningActionProps {
    readonly onDecline: () => void;
    readonly declining: boolean;
}
const InvitationTabRowDecliningAction = ({
    onDecline,
    declining,
}: InvitationTabRowDecliningActionProps) => {
    const { t } = useTranslation();

    return (
        <AppButton
            variant="destructive"
            size="sm"
            onClick={onDecline}
            disabled={declining}>
            {declining && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            {!declining && <X className="h-3.5 w-3.5 mr-1" />}
            {t("sharedFiles.decline")}
        </AppButton>
    )
}