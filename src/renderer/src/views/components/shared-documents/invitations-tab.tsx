import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, AlertTriangle } from "lucide-react";
import { CollapsibleInfoBanner } from "@/components/collapsible_info_banner";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { format } from "date-fns";
import FilterInput from "../base/filter-input";
import FilterSelect from "../base/filter-select";
import List from "@/components/app/list";
import { InvitationTabRowActions } from "../base/invitation-tab-row-actions";
import { AppDispatch } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { acceptInvitation, declineInvitation, downloadAndSaveDocument, filterInvitations } from "@/views/store/document/slice";
import {
    selectInvitations,
    selectAcceptInvitationIdLoading,
    selectDeclineInvitationIdLoading,
    selectDownloadDocumentIdLoading,
    selectSaveFileDocumentIdLoading
} from "@/views/store/document/selector";

export function InvitationsTab() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const invitations = useSelector(selectInvitations)
    const selectAcceptInvitationWithIdLoading = useSelector(selectAcceptInvitationIdLoading)
    const declineInvitationWithIdLoading = useSelector(selectDeclineInvitationIdLoading)
    const downloadDocumentWithIdLoading = useSelector(selectDownloadDocumentIdLoading)
    const saveDocumentWithIdLoading = useSelector(selectSaveFileDocumentIdLoading)

    const [searchFileName, setSearchFileName] = useState("");
    const [searchOwner, setSearchOwner] = useState("");
    const [statusFilter, setStatusFilter] = useState<InvitationStatus | "All">("All");

    useEffect(() => {
        dispatch(filterInvitations({
            filename: searchFileName,
            userFullName: searchOwner,
            invitationStatus: statusFilter,
        }))
    }, [searchFileName, searchOwner, statusFilter])

    const newVersionAvailable = useCallback((invitation: Invitation) => {
        const lastUpdateDate = invitation.documentDto.lastUpdateDate
        const downloadDate = invitation.downloadDate
        if (!lastUpdateDate || !downloadDate)
            return false

        return new Date(downloadDate) < new Date(lastUpdateDate)
    }, [invitations])

    const downloadDocumentHandler = useCallback((invitation: Invitation) => {
        dispatch(downloadAndSaveDocument({
            documentId: invitation.documentId,
            filename: invitation.documentDto?.fileName || "default.critx"
        }));
    }, [dispatch])

    return (
        <div className="flex flex-col h-full">
            {<CollapsibleInfoBanner
                icon={<AlertTriangle className="h-5 w-5" />}
                title={t("sharedFiles.newVersionAvailableTitle")}
                description={t("sharedFiles.newVersionAvailableDescription")}
                variant="warning"
                className="mb-4"
                collapsible={true}
            />}

            <div className="border rounded-lg gap-6 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("sharedFiles.filters")}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                        <FilterInput
                            className="space-y-1"
                            title={t("sharedFiles.file")}
                            placeholder={t("sharedFiles.searchByFileName")}
                            value={searchFileName}
                            onChange={setSearchFileName}
                        />
                        <FilterInput
                            className="space-y-1"
                            title={t("sharedFiles.collaborator")}
                            placeholder={t("sharedFiles.searchByCollaborator")}
                            value={searchOwner}
                            onChange={setSearchOwner}
                        />
                        <FilterSelect
                            className="space-y-1"
                            title={t("sharedFiles.invitationStatus")}
                            placeholder={t("sharedFiles.allStatuses")}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        />
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-foreground">{t("sharedFiles.file")}</TableHead>
                            <TableHead className="font-semibold text-foreground">{t("sharedFiles.dateOfFirstSharing")}</TableHead>
                            <TableHead className="font-semibold text-foreground">{t("sharedFiles.dateOfLastSharing")}</TableHead>
                            <TableHead className="font-semibold text-foreground">{t("sharedFiles.deadlineForInvitation")}</TableHead>
                            <TableHead className="font-semibold text-foreground">{t("sharedFiles.dateOfDownload")}</TableHead>
                            <TableHead className="font-semibold text-foreground">{t("sharedFiles.owner")}</TableHead>
                            <TableHead className="font-semibold text-foreground">{t("sharedFiles.invitationStatus")}</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">{t("sharedFiles.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <List
                            data={invitations}
                            renderItem={(invitation) => {
                                return (
                                    <TableRow
                                        key={invitation.inviteId}
                                        className={cn(
                                            newVersionAvailable(invitation) &&
                                            invitation.invitationStatus === "Accepted" &&
                                            "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
                                        )}>
                                        <TableCell>
                                            <div
                                                className="flex items-center gap-2">
                                                {newVersionAvailable(invitation) &&
                                                    invitation.invitationStatus === "Accepted" &&
                                                    <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />}
                                                <span
                                                    className={cn(
                                                        "font-medium",
                                                        newVersionAvailable(invitation) &&
                                                        invitation.invitationStatus === "Accepted" &&
                                                        "text-red-700 dark:text-red-300",
                                                    )}>
                                                    {invitation.documentDto.fileName}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {invitation.creationDate
                                                ? format(new Date(invitation.creationDate), 'dd/MM/yyyy HH:mm:ss')
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {invitation.documentDto.lastUpdateDate
                                                ? format(new Date(invitation.documentDto.lastUpdateDate), 'dd/MM/yyyy HH:mm:ss')
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {invitation.invitationExpirationDate
                                                ? format(new Date(invitation.invitationExpirationDate), 'dd/MM/yyyy HH:mm:ss')
                                                : '-'}
                                        </TableCell>
                                        <TableCell className={cn(
                                            invitation.downloadDate
                                                ? "text-muted-foreground"
                                                : "text-muted-foreground/60 italic"
                                        )}>
                                            {invitation.downloadDate
                                                ? format(new Date(invitation.downloadDate), 'dd/MM/yyyy HH:mm:ss')
                                                : t("sharedFiles.notDownloaded")}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {invitation.userDocumentOwner.userName} {invitation.userDocumentOwner.userSurname}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={invitation.invitationStatus} />
                                        </TableCell>
                                        <TableCell>
                                            <InvitationTabRowActions
                                                invitation={invitation}
                                                onAccept={() => {
                                                    dispatch(acceptInvitation(invitation.inviteId));
                                                }}
                                                accepting={selectAcceptInvitationWithIdLoading === invitation.inviteId}
                                                onDecline={() => {
                                                    dispatch(declineInvitation(invitation.inviteId));
                                                }}
                                                declining={declineInvitationWithIdLoading === invitation.inviteId}
                                                onDownload={() => {
                                                    downloadDocumentHandler(invitation)
                                                }}
                                                downloading={
                                                    downloadDocumentWithIdLoading === invitation.documentDto.documentId
                                                    || saveDocumentWithIdLoading === invitation.documentDto.documentId
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            }} />

                        {invitations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    {t("sharedFiles.noFilesFound")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
}