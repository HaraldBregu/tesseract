import AppButton from "@/components/app/app-button";
import { AppDialog, AppDialogContent, AppDialogHeader, AppDialogTitle, AppDialogDescription, AppDialogFooter } from "@/components/app/app-dialog";
import { AppPopover, AppPopoverTrigger, AppPopoverContent } from "@/components/app/app-popover";
import { cn } from "@/lib/utils";
import { Users, ChevronDown, Ban, RotateCcw, Loader2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import List from "@/components/app/list";
import { format } from "date-fns";
import { StatusBadge } from "../shared-documents/status-badge";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { clearResendInvitation, clearRevokeInvitation, resendInvitation, revokeInvitation } from "@/views/store/document/slice";
import { selectResendInvitationError, selectResendInvitationIdLoading, selectRevokeInvitationError, selectRevokeInvitationIdLoading } from "@/views/store/document/selector";

interface CollaboratorsListPopoverProps {
    readonly invitationList: SharedDocumentInvitedUser[]
}
const CollaboratorsListPopover = ({
    invitationList,
}: CollaboratorsListPopoverProps) => {
    const { t } = useTranslation()
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const revokeInvitationWithIdLoading = useSelector(selectRevokeInvitationIdLoading)
    const revokeInvitationError = useSelector(selectRevokeInvitationError)
    const resendInvitationWithIdLoading = useSelector(selectResendInvitationIdLoading)
    const resendInvitationError = useSelector(selectResendInvitationError)
    const canRevokeInvitation = useCallback((invitationStatus: InvitationStatus) => invitationStatus === "Accepted" || invitationStatus === "Pending", [])

    useEffect(() => {
        dispatch(clearRevokeInvitation())
        if (!revokeInvitationError)
            return;

        switch (revokeInvitationError) {
            case "UNAUTHENTICATED":
            case "CURRENT_USER_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("user is not authenticated")
                });
                break;
            case "INTERNAL_SERVER_ERROR":
                toast.error(t("share.error"), {
                    description: t("internal server error")
                });
                break;
            case "UNAUTHORIZED":
                toast.error(t("share.error"), {
                    description: t("unauthorized")
                });
                break;
            case "INVALID_STATUS_REVOKE":
                toast.error(t("share.error"), {
                    description: t("invalid status revoke")
                });
                break;
            case "INVITE_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("invitation not found")
                });
                break;
            case "UNKNOWN_ERROR":
            default:
                toast.error(t("share.error"), {
                    description: t("share.errors.unknownError")
                });
                break;
        }
    }, [revokeInvitationError, t])

    useEffect(() => {
        dispatch(clearResendInvitation())
        if (!resendInvitationError)
            return;

        switch (resendInvitationError) {
            case "UNAUTHENTICATED":
            case "CURRENT_USER_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("user is not authenticated")
                });
                break;
            case "INTERNAL_SERVER_ERROR":
                toast.error(t("share.error"), {
                    description: t("internal server error")
                });
                break;
            case "UNAUTHORIZED":
                toast.error(t("share.error"), {
                    description: t("unauthorized")
                });
                break;
            case "INVALID_STATUS_RESEND":
                toast.error(t("share.error"), {
                    description: t("invalid status resend")
                });
                break;
            case "INVITE_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("invitation not found")
                });
                break;
            case "UNKNOWN_ERROR":
            default:
                toast.error(t("share.error"), {
                    description: t("share.errors.unknownError")
                });
                break;
        }
    }, [resendInvitationError, t])

    return (
        <>
            <AppPopover>
                <AppPopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-input rounded-md px-2 py-1 hover:bg-muted/50">
                        <Users className="h-4 w-4" />
                        <span>{t("sharedFiles.viewCollaborators", { count: invitationList.length })}</span>
                        <ChevronDown className={cn("h-3 w-3 transition-transform", "rotate-180")} />
                    </button>
                </AppPopoverTrigger>
                <AppPopoverContent className="w-[550px] p-0" align="start">
                    <div className="border-b border-border px-4 py-3">
                        <h4 className="font-medium text-sm">{t("sharedFiles.collaboratorsList")}</h4>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        <div className="grid grid-cols-[1fr,100px,150px,80px] gap-2 px-4 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
                            <span>{t("sharedFiles.collaborator")}</span>
                            <span>{t("sharedFiles.invitationStatus")}</span>
                            <span>{t("sharedFiles.dateOfDownload")}</span>
                            <span>{t("sharedFiles.actions")}</span>
                        </div>
                        <List
                            data={invitationList}
                            renderItem={(invitation) => {
                                return (
                                    <div
                                        key={invitation.inviteId}
                                        className="grid grid-cols-[1fr,100px,150px,80px] gap-2 px-4 py-2 border-b border-border last:border-b-0 items-center hover:bg-muted/30"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate">
                                                {invitation.invitedUserDto.userName} {invitation.invitedUserDto.userSurname}
                                            </span>
                                        </div>
                                        <div>
                                            <StatusBadge status={invitation.invitationStatus} />
                                        </div>
                                        <span
                                            className={cn(
                                                "text-sm",
                                                invitation.downloadDate
                                                    ? "text-foreground"
                                                    : "text-muted-foreground italic"
                                            )}>
                                            {invitation.downloadDate
                                                ? format(new Date(invitation.downloadDate), 'dd/MM/yyyy HH:mm:ss')
                                                : '-'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {canRevokeInvitation(invitation.invitationStatus) && <AppButton
                                                variant="button-icon-destructive"
                                                size="icon-xs"
                                                onClick={() => {
                                                    dispatch(revokeInvitation(invitation.inviteId))
                                                }}
                                                disabled={revokeInvitationWithIdLoading === invitation.inviteId}
                                                title={t("sharedFiles.revoke")}>
                                                {revokeInvitationWithIdLoading === invitation.inviteId && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                {(!revokeInvitationWithIdLoading || revokeInvitationWithIdLoading !== invitation.inviteId) && <Ban className="h-3.5 w-3.5" />}
                                            </AppButton>}
                                            {!canRevokeInvitation(invitation.invitationStatus) && <AppButton
                                                variant="button-icon"
                                                size="icon-xs"
                                                onClick={() => {
                                                    dispatch(resendInvitation(invitation.inviteId))
                                                }}
                                                disabled={resendInvitationWithIdLoading === invitation.inviteId}
                                                title={t("sharedFiles.resendInvite")}>
                                                {resendInvitationWithIdLoading === invitation.inviteId && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                {(!resendInvitationWithIdLoading || resendInvitationWithIdLoading !== invitation.inviteId) && <RotateCcw className="h-3.5 w-3.5" />}
                                            </AppButton>}
                                        </div>
                                    </div>
                                )
                            }}
                        />
                    </div>
                </AppPopoverContent>
            </AppPopover>

            <AppDialog
                open={revokeDialogOpen}
                onOpenChange={setRevokeDialogOpen}>
                <AppDialogContent>
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t("sharedFiles.revokeConfirmTitle")}
                        </AppDialogTitle>
                        <AppDialogDescription>
                            {t("sharedFiles.revokeConfirmDescription")}
                        </AppDialogDescription>
                    </AppDialogHeader>
                    <AppDialogFooter>
                        <AppButton variant="outline" onClick={() => {
                            setRevokeDialogOpen(false);
                        }}>
                            {t("common.cancel")}
                        </AppButton>
                        <AppButton variant="destructive" onClick={() => {
                            setRevokeDialogOpen(false);
                        }}>
                            {t("sharedFiles.revoke")}
                        </AppButton>
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>
        </>

    )
}

export default CollaboratorsListPopover;