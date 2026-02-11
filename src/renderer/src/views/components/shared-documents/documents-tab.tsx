import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    Filter,
    Share2,
    Upload,
    Trash2,
    FileText,
    Loader2,
} from "lucide-react";
import AppButton from "@/components/app/app-button";
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
import { format } from "date-fns";
import List from "@/components/app/list";
import ShareDocumentDialog from "../dialogs/share-document-dialog";
import CollaboratorsListPopover from "../popovers/collaborators-list-popover";
import FilterInput from "../base/filter-input";
import FilterSelect from "../base/filter-select";
import { useDispatch, useSelector } from "react-redux";
import { selectDeleteDocumentData, selectDeleteDocumentError, selectDeleteDocumentIdLoading, selectDeleteDocumentLoading, selectMyDocuments, selectUploadDocumentIdLoading } from "@/views/store/document/selector";
import { AppDispatch } from "@/store/store";
import { deleteDocument, filterMyDocuments, uploadDocument } from "@/views/store/document/slice";
import DeleteDocumentDialog from "../dialogs/delete-document-dialog";

interface DocumentsTabProps {
    readonly onDocumentShared: () => void
}
export function DocumentsTab({
    onDocumentShared,
}: DocumentsTabProps) {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const myDocuments = useSelector(selectMyDocuments)
    const deleteDocumentError = useSelector(selectDeleteDocumentError)
    const deleteDocumentSuccess = useSelector(selectDeleteDocumentData)
    const deleteDocumentIdLoading = useSelector(selectDeleteDocumentIdLoading)
    const deletingDocument = useSelector(selectDeleteDocumentLoading);
    const uploadDocumentIdLoading = useSelector(selectUploadDocumentIdLoading)

    const [currentTabFileName, setCurrentTabFileName] = useState<string | null>(null)
    const [selectedDocument, setSelectedDocument] = useState<SharedDocument>()
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false)
    const [shareDialogVisible, setShareDialogVisible] = useState<boolean>(false)

    const [searchFileName, setSearchFileName] = useState("");
    const [searchCollaborator, setSearchCollaborator] = useState("");
    const [statusFilter, setStatusFilter] = useState<InvitationStatus | "All">("All");

    useEffect(() => {
        (async () => {
            const filename = await globalThis.tabs.getCurrenTabFileName();
            setCurrentTabFileName(filename)
        })()
    }, [])

    useEffect(() => {
        dispatch(filterMyDocuments({
            filename: searchFileName,
            collaboratorFullName: searchCollaborator,
            invitationStatus: statusFilter,
        }))
    }, [searchFileName, searchCollaborator, statusFilter])

    const showShareDocument = useCallback((document: SharedDocument) => {
        setSelectedDocument(document)
        setShareDialogVisible(true)
    }, [dispatch]);

    const showConfirmDeleteDocument = useCallback((document: SharedDocument) => {
        setSelectedDocument(document)
        setDeleteDialogVisible(true)
    }, [dispatch])

    useEffect(() => {
        if (!deleteDocumentError)
            return;

        switch (deleteDocumentError) {
            case "UNAUTHENTICATED":
            case "CURRENT_USER_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("user is not authenticated")
                });
                break;
            case "DOCUMENT_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("Document not found")
                });
                break;
            case "UNAUTHORIZED":
                toast.error(t("share.error"), {
                    description: t("unauthorized")
                });
                break;
            case "ERROR_DELETION_DOCUMENT":
                toast.error(t("share.error"), {
                    description: t("error deleting document")
                });
                break;
            case "MISSING_REQUIRED_PARAMS":
                toast.error(t("share.error"), {
                    description: t("missing required paramaters")
                });
                break;
            case "UNKNOWN_ERROR":
            default:
                toast.error(t("share.error"), {
                    description: t("share.errors.unknownError")
                });
                break;
        }
    }, [deleteDocumentError, t])

    useEffect(() => {
        if (!deleteDocumentSuccess)
            return;

        setSelectedDocument(undefined)
        setDeleteDialogVisible(false)
    }, [deleteDocumentSuccess, t])

    return (
        <>
            <div className="flex flex-col h-full">
                <CollapsibleInfoBanner
                    icon={<FileText className="h-5 w-5" />}
                    title={t("sharedFiles.activeDocumentTitle")}
                    description={t("sharedFiles.activeDocumentDescription")}
                    variant="info"
                    className="mb-4"
                    collapsible={true}
                />

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
                                value={searchCollaborator}
                                onChange={setSearchCollaborator}
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
                                <TableHead className="font-semibold text-foreground">{t("sharedFiles.collaborators")}</TableHead>
                                <TableHead className="font-semibold text-foreground text-right">{t("sharedFiles.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <List
                                data={myDocuments}
                                renderItem={(document) => {
                                    return (
                                        <TableRow
                                            key={document.documentId}
                                            className={cn(
                                                currentTabFileName === document.fileName && "bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30"
                                            )}>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        <span className={cn("font-medium", "text-blue-700 dark:text-blue-300")}>
                                                            {document.fileName || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(document.creationDate), 'dd/MM/yyyy HH:mm:ss')}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {document.lastUpdateDate
                                                    ? format(new Date(document.lastUpdateDate), 'dd/MM/yyyy HH:mm:ss')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {document.inviteDocumentResponseDTOS?.length === 0 ?
                                                    <span>no invites</span> :
                                                    <CollaboratorsListPopover invitationList={document.inviteDocumentResponseDTOS || []} />
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1">
                                                    <AppButton
                                                        variant="button-icon"
                                                        size="icon-xs"
                                                        onClick={() => showShareDocument(document)}
                                                        title={t("sharedFiles.share")}>
                                                        <Share2 className="h-4 w-4" />
                                                    </AppButton>
                                                    <AppButton
                                                        variant="button-icon"
                                                        size="icon-xs"
                                                        onClick={() => dispatch(uploadDocument({ documentId: document.documentId }))}
                                                        disabled={
                                                            currentTabFileName !== document.fileName
                                                            || uploadDocumentIdLoading === document.documentId
                                                        }
                                                        title={t("sharedFiles.upload")}>
                                                        {uploadDocumentIdLoading === document.documentId && <Loader2 className="h-4 w-4 animate-spin" />}
                                                        {(!uploadDocumentIdLoading || uploadDocumentIdLoading !== document.documentId) && <Upload className="h-4 w-4" />}
                                                    </AppButton>
                                                    <AppButton
                                                        variant="button-icon-destructive"
                                                        size="icon-xs"
                                                        onClick={() => showConfirmDeleteDocument(document)}
                                                        title={t("sharedFiles.delete")}>
                                                        {deleteDocumentIdLoading === document.documentId && <Loader2 className="h-4 w-4 animate-spin" />}
                                                        {(!deleteDocumentIdLoading || deleteDocumentIdLoading !== document.documentId) && <Trash2 className="h-4 w-4" />}
                                                    </AppButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }} />

                            {myDocuments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {t("sharedFiles.noFilesFound")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            {selectedDocument && <ShareDocumentDialog
                open={shareDialogVisible}
                onOpenChange={setShareDialogVisible}
                document={selectedDocument}
                onShareSuccess={() => {
                    onDocumentShared()
                }}
            />}

            {selectedDocument && <DeleteDocumentDialog
                open={deleteDialogVisible}
                onOpenChange={setDeleteDialogVisible}
                document={selectedDocument}
                deleting={deletingDocument}
                onCancel={() => {
                    setSelectedDocument(undefined)
                    setDeleteDialogVisible(false)
                }}
                onConfirm={() => {
                    dispatch(deleteDocument(selectedDocument.documentId))
                }}
            />}
        </>
    );
}
