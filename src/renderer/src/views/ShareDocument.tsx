import { useState, useEffect } from "react";
import { Building2, Loader2, Mail, UserPlus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from "sonner";
import AppButton from "@/components/app/app-button";
import { ThemeProvider } from "@/providers/theme-provider";
import List from "@/components/app/list";
import { getInitials } from "@/utils/utils";
import LogoSection from "./components/base/logo-section";
import OwnerSection from "./components/base/owner-section";
import SearchInputSection from "./components/base/search-input-section";
import MessageAreaSection from "./components/base/message-area-section";
import SearchResultsSection from "./components/base/search-result-section";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SelectedCollaboratorsSection from "./components/base/selected-collaborators-section";

function handleClose() {
    globalThis.electron.ipcRenderer.send('close-share-document-window');
}

const ShareDocument = () => {
    const { t } = useTranslation();
    const [documentName, setDocumentName] = useState<string>("");
    const [documentFilePath, setDocumentFilePath] = useState<string | null>(null);
    const [document, setDocument] = useState<DocumentData | null>(null);
    const [ownerName, setOwnerName] = useState<string>("");
    const [ownerEmail, setOwnerEmail] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [invitationMessage, setInvitationMessage] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchUserSuccess[]>([]);
    const [selectedCollaborators, setSelectedCollaborators] = useState<Set<SearchUserSuccess>>(new Set());

    useEffect(() => {
        const loadData = async () => {
            const user = await window.user.currentUser();
            setOwnerName(`${user.firstname} ${user.lastname}`);
            setOwnerEmail(user.email);

            const filename = await window.tabs.getCurrenTabFileName();
            setDocumentName(filename || 'no_path');

            const filepath = await window.tabs.getCurrenTabFilePath();
            setDocumentFilePath(filepath);

            const document = await window.doc.getDocument();
            setDocument(document)
        };
        loadData();
    }, []);

    function handleSearch(query: string) {
        if (!document?.id)
            return;

        setSearchQuery(query);
        if (query.length < 3)
            return;

        setIsSearching(true);
        window.user.searchUsers({
            textToSearch: query,
            fields: [
                "userEmail",
                "userInstitution",
                "userName",
                "userSurname",
                "userKeywords",
            ],
            documentId: document.id,
        }).then((result) => {
            switch (result.success) {
                case false: {
                    const resultError = result.error
                    const errorType = resultError.type
                    switch (errorType) {
                        case "INVALID_SEARCH_PARAMS":
                            toast.error(t("share.error"), {
                                description: t("share.errors.invalidInputData")
                            });
                            break;
                        case "UNAUTHORIZED":
                            toast.error(t("share.error"), {
                                description: t("share.errors.unauthorized")
                            });
                            break;
                        case "UNKNOWN_ERROR":
                        default:
                            toast.error(t("share.error"), {
                                description: t("share.errors.unknownError")
                            });
                            break;
                    }
                    break;
                }
                case true: {
                    setSearchResults(result.data);
                    break;
                }
            }
            setIsSearching(false);
        }).catch(() => {
            setSearchResults([]);
            setIsSearching(false);
        });
    }

    function toggleCollaborator(collaborator: SearchUserSuccess) {
        const newSelected = new Set(selectedCollaborators);
        if (newSelected.has(collaborator)) {
            newSelected.delete(collaborator);
        } else {
            newSelected.add(collaborator);
        }
        setSelectedCollaborators(newSelected);
    }

    function removeCollaborator(collaborator: SearchUserSuccess) {
        const newSelected = new Set(selectedCollaborators);
        newSelected.delete(collaborator)
        setSelectedCollaborators(newSelected);
    }

    async function handleSubmit() {
        if (selectedCollaborators.size === 0 || invitationMessage.trim() === "") {
            toast.error(t("share.error"), {
                description: t("share.errors.noCollaboratorsSelectedOrMessageEmpty")
            });
            setIsSubmitting(false);
            return;
        }

        if (!document?.id || !documentFilePath)
            return;

        setIsSubmitting(true);

        const collabArray = Array.from(selectedCollaborators)
            .map(user => user.userId)
            .filter(userId => userId !== null && userId !== undefined)

        window.invite.uploadDocumentAndSendInvites({
            filepath: documentFilePath,
            documentId: document.id,
            invitedUsersIds: collabArray,
            message: invitationMessage,
        }).then((result) => {
            switch (result.success) {
                case false: {
                    const resultError = result.error
                    const errorType = resultError.type
                    switch (errorType) {
                        case "UNAUTHENTICATED":
                        case "CURRENT_USER_NOT_FOUND":
                            toast.error(t("share.error"), {
                                description: t("user is not authenticated")
                            });
                            break;
                        case "INVALID_INPUT_DATA":
                            toast.error(t("share.error"), {
                                description: t("invalid input data")
                            });
                            break;
                        case "INVALID_DOCUMENT_ID":
                            toast.error(t("share.error"), {
                                description: t("invalid document id")
                            });
                            break;
                        case "DOCUMENT_NOT_FOUND":
                            toast.error(t("share.error"), {
                                description: t("document not found")
                            });
                            break;
                        case "UNAUTHORIZED":
                            toast.error(t("share.error"), {
                                description: t("unauthorized")
                            });
                            break;
                        case "USER_NOT_FOUND":
                            toast.error(t("share.error"), {
                                description: t("user not found")
                            });
                            break;
                        case "ERROR_UPLOADING_DOCUMENT":
                            toast.error(t("share.error"), {
                                description: t("error uploading document")
                            });
                            break;
                        case "NO_PERMISSION":
                            toast.error(t("share.error"), {
                                description: t("no permission")
                            });
                            break;
                        case "USER_OR_DOCUMENT_NOT_FOUND":
                            toast.error(t("share.error"), {
                                description: t("user or document not found")
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
                    break;
                }
                case true: {
                    toast.success(t("share.invitesSentSuccessfully"));
                    setSearchResults([]);
                    setSelectedCollaborators(new Set());
                    setInvitationMessage("");
                    setSearchQuery("");
                    break;
                }
            }

            setIsSubmitting(false);
        }).catch(() => {
            setIsSubmitting(false);
        })
    }

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 min-h-0">
                <LogoSection
                    title={t("share.document")}
                    description={documentName}
                />
                <OwnerSection
                    label={t("share.documentOwner")}
                    fullname={ownerName}
                    email={ownerEmail}
                />
                <SearchInputSection
                    title={t("share.searchForCollaborators")}
                    placeholder={t("share.searchPlaceholder")}
                    onSearchChange={handleSearch}
                    searchQuery={searchQuery}
                    disabled={isSubmitting}
                />
                <SearchResultsSection
                    visible={searchQuery.length > 2}
                    title={t("share.searchResults") + " (" + searchResults.length + ")"}
                    loading={isSearching}
                    empty={searchResults.length === 0}
                    emptyText={t("share.noResults")}>
                    <List
                        data={Array.from(searchResults)}
                        renderItem={(collaborator) => {
                            const isSelected = selectedCollaborators.has(collaborator);
                            return (
                                <div
                                    key={collaborator.userId}
                                    className={cn(
                                        "p-4 border-b last:border-b-0 border-grey-80 dark:border-grey-30 transition-colors",
                                        isSelected && "bg-primary-95 dark:bg-primary-30"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <p className="font-medium">{collaborator.userName} {collaborator.userSurname}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Building2 className="h-3 w-3" />
                                                <span>{collaborator.userInstitution}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                <span>{collaborator.userEmail}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {collaborator.userKeywords?.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                        className="text-xs bg-grey-90 dark:bg-grey-30 border-grey-70 dark:border-grey-40"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <AppButton
                                            size="sm"
                                            variant={isSelected ? "outline" : "default"}
                                            onClick={() => toggleCollaborator(collaborator)}
                                            disabled={isSubmitting}>
                                            <UserPlus className="h-3 w-3" />
                                            {isSelected ? t("share.added") : t("share.add")}
                                        </AppButton>
                                    </div>
                                </div>
                            );
                        }}
                    />
                </SearchResultsSection>
                <SelectedCollaboratorsSection
                    title={t("share.invitationMessage")}
                    visible={selectedCollaborators.size > 0}>
                    <List
                        data={Array.from(selectedCollaborators)}
                        renderItem={(data) => {
                            return (
                                <div
                                    key={data.userId}
                                    className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 rounded-full px-3 py-1.5"
                                >
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold">
                                        {getInitials(data.userName || "")}
                                    </div>
                                    <span className="text-sm font-medium">{data.userName}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeCollaborator(data)}
                                        disabled={isSubmitting}
                                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors disabled:opacity-50"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        }}
                    />
                </SelectedCollaboratorsSection>
                <MessageAreaSection
                    title={t("share.invitationMessage")}
                    placeholder={t("share.invitationMessagePlaceholder")}
                    value={invitationMessage}
                    onMessageChange={setInvitationMessage}
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex-shrink-0 border-t border-grey-80 dark:border-grey-30 bg-background">
                <div className="flex justify-end gap-2 px-4 py-2">
                    <AppButton
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}>
                        {t("share.cancel")}
                    </AppButton>
                    <AppButton
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={handleSubmit}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? t("share.sending") : t("share.send")}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default function ShareDocumentPage() {
    return (
        <ThemeProvider>
            <ShareDocument />
            <Toaster closeButton position="top-right" richColors />
        </ThemeProvider>
    );
}
