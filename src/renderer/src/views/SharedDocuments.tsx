import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import AppButton from "@/components/app/app-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { DocumentsTab } from "./components/shared-documents/documents-tab";
import { InvitationsTab } from "./components/shared-documents/invitations-tab";
import { fetchInvitations, fetchMyDocuments } from "./store/document/slice";
import {
    selectInvitationsLoading,
    selectInvitationsError,
    selectMyDocumentsLoading,
    selectMyDocumentsError
} from "./store/document/selector";
import type { AppDispatch } from "@/store/store";

function handleClose() {
    globalThis.electron.ipcRenderer.send("close-shared-files-window");
}

type TabTypes = "MY_DOCUMENTS" | "SHARED_DOCUMENTS"

function SharedDocumentsView() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<TabTypes>("MY_DOCUMENTS");

    const loadingMyDocuments = useSelector(selectMyDocumentsLoading);
    const myDocumentsError = useSelector(selectMyDocumentsError);
    const loadingInvitations = useSelector(selectInvitationsLoading);
    const invitationsError = useSelector(selectInvitationsError);

    useEffect(() => {
        if (!myDocumentsError)
            return;

        switch (myDocumentsError) {
            case "UNAUTHENTICATED":
            case "CURRENT_USER_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("user is not authenticated")
                });
                break;
            case "INVALID_PAGINATION_PARAMS":
                toast.error(t("share.error"), {
                    description: t("invalid document id")
                });
                break;
            case "UNAUTHORIZED":
                toast.error(t("share.error"), {
                    description: t("unauthorized")
                });
                break;
            case "ERROR_RETRIEVING_DOCUMENT":
                toast.error(t("share.error"), {
                    description: t("error retrieving document")
                });
                break;
            case "NO_DOCUMENT_FOUND":
                // toast.error(t("share.error"), {
                //     description: t("no documents found")
                // });
                break;
            case "UNKNOWN_ERROR":
            default:
                toast.error(t("share.error"), {
                    description: t("share.errors.unknownError")
                });
                break;
        }
    }, [myDocumentsError, t])

    useEffect(() => {
        if (!invitationsError)
            return;

        switch (invitationsError) {
            case "UNAUTHENTICATED":
            case "CURRENT_USER_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("user is not authenticated")
                });
                break;
            case "USER_OR_DOCUMENT_NOT_FOUND":
                toast.error(t("share.error"), {
                    description: t("user or document not found")
                });
                break;
            case "UNAUTHORIZED":
                toast.error(t("share.error"), {
                    description: t("unauthorized")
                });
                break;
            case "INTERNAL_SERVER_ERROR":
                toast.error(t("share.error"), {
                    description: t("internal server error")
                });
                break;
            case "UNKNOWN_ERROR":
            default:
                toast.error(t("share.error"), {
                    description: t("share.errors.unknownError")
                });
                break;
        }
    }, [invitationsError, t]);

    useEffect(() => {
        if (activeTab === "MY_DOCUMENTS")
            dispatch(fetchMyDocuments());

        if (activeTab === "SHARED_DOCUMENTS")
            dispatch(fetchInvitations());

    }, [activeTab, dispatch])

    const onTabValueChange = useCallback((value: string) => {
        setActiveTab(value as TabTypes)
    }, [])

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="flex-1 flex flex-col min-h-0 p-4">
                <Tabs
                    value={activeTab}
                    onValueChange={onTabValueChange}
                    className="flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 gap-1">
                        <TabsTrigger value="MY_DOCUMENTS">
                            {loadingMyDocuments && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("sharedFiles.myFiles")}
                        </TabsTrigger>
                        <TabsTrigger value="SHARED_DOCUMENTS">
                            {loadingInvitations && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("sharedFiles.sharedWithMe")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="MY_DOCUMENTS" className="flex-1 mt-0 min-h-0">
                        <DocumentsTab onDocumentShared={() => { }} />
                    </TabsContent>
                    <TabsContent value="SHARED_DOCUMENTS" className="flex-1 mt-0 min-h-0">
                        <InvitationsTab />
                    </TabsContent>
                </Tabs>
            </div>
            <div className="flex-shrink-0 border-t border-grey-80 dark:border-grey-30 bg-background">
                <div className="flex justify-end px-4 py-2">
                    <AppButton variant="outline" size="sm" onClick={handleClose}>
                        {t("sharedFiles.close")}
                    </AppButton>
                </div>
            </div>
        </div>
    );
}

export default function SharedDocumentsPage() {
    return (
        <ThemeProvider>
            <SharedDocumentsView />
            <Toaster closeButton position="top-right" richColors />
        </ThemeProvider>
    );
}
