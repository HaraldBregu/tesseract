import { useTranslation } from "react-i18next";
import { Loader2, RotateCcw, Ban } from "lucide-react";
import AppButton from "@/components/app/app-button";

export interface CollaboratorActionsProps {
    collaborator: SharedDocumentInvitedUser;
    fileId: string;
    isFileInFocus: boolean;
    loadingActions: Record<string, boolean>;
    onRevoke: (fileId: string, collaboratorId: string, requiresConfirmation: boolean) => void;
    onResendInvite: (fileId: string, collaboratorId: string) => void;
}

export function CollaboratorActions({
    collaborator,
    fileId,
    isFileInFocus,
    loadingActions,
    onRevoke,
    onResendInvite,
}: Readonly<CollaboratorActionsProps>) {
    const { t } = useTranslation();
    const { invitationStatus: status, invitedUserId: collaboratorId } = collaborator;

    const isRevokeLoading = loadingActions[`revoke-${fileId}-${collaboratorId}`];
    const isResendLoading = loadingActions[`resend-${fileId}-${collaboratorId}`];

    // Define available actions based on status
    const canRevoke = status === "Accepted" || status === "Pending";
    const canResend = status === "Pending" || status === "Declined" || status === "Revoked";
    const requiresRevokeConfirmation = status === "Pending";

    if (!canRevoke && !canResend) {
        return null;
    }

    return (
        <div className="flex items-center gap-1">
            {canRevoke && (
                <AppButton
                    variant="button-icon-destructive"
                    size="icon-xs"
                    onClick={() => onRevoke(fileId, collaboratorId, requiresRevokeConfirmation)}
                    disabled={!isFileInFocus || isRevokeLoading}
                    title={t("sharedFiles.revoke")}
                >
                    {isRevokeLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Ban className="h-3.5 w-3.5" />
                    )}
                </AppButton>
            )}
            {canResend && (
                <AppButton
                    variant="button-icon"
                    size="icon-xs"
                    onClick={() => onResendInvite(fileId, collaboratorId)}
                    disabled={!isFileInFocus || isResendLoading}
                    title={t("sharedFiles.resendInvite")}
                >
                    {isResendLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                    )}
                </AppButton>
            )}
        </div>
    );
}
