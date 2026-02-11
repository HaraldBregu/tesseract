import AppButton from "@/components/app/app-button"
import { AppDialog, AppDialogContent, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog"
import { t } from "i18next"
import { Building2, Loader2, Mail, UserPlus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import List from "@/components/app/list"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/utils/utils"
import LogoSection from "../base/logo-section"
import OwnerSection from "../base/owner-section"
import SearchInputSection from "../base/search-input-section"
import MessageAreaSection from "../base/message-area-section"
import SearchResultsSection from "../base/search-result-section"
import SelectedCollaboratorsSection from "../base/selected-collaborators-section"

interface ShareDocumentDialogProps {
    open: boolean
    document: SharedDocument;
    onOpenChange?(open: boolean): void;
    onShareSuccess(): void
}
const ShareDocumentDialog = ({
    open,
    document,
    onOpenChange,
    onShareSuccess,
}: ShareDocumentDialogProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchUserSuccess[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invitationMessage, setInvitationMessage] = useState("");
    const [selectedCollaborators, setSelectedCollaborators] = useState<Set<SearchUserSuccess>>(new Set());
    const [ownerName, setOwnerName] = useState<string>("");
    const [ownerEmail, setOwnerEmail] = useState<string>("");

    useEffect(() => {
        const loadData = async () => {
            const user = await window.user.currentUser();
            setOwnerName(`${user.firstname} ${user.lastname}`);
            setOwnerEmail(user.email);
        };
        loadData();
    }, []);

    function removeCollaborator(collaborator: SearchUserSuccess) {
        const newSelected = new Set(selectedCollaborators);
        newSelected.delete(collaborator)
        setSelectedCollaborators(newSelected);
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

    function handleSearch(query: string) {
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
            documentId: document.documentId,
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

    async function handleSubmit() {
        if (selectedCollaborators.size === 0 || invitationMessage.trim() === "") {
            toast.error(t("share.error"), {
                description: t("share.errors.noCollaboratorsSelectedOrMessageEmpty")
            });
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);

        const collabArray = Array.from(selectedCollaborators)
            .map(user => user.userId)
            .filter(userId => userId !== null && userId !== undefined)

        window.invite.sendInvites({
            documentId: document.documentId,
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
                        case "UNAUTHORIZED":
                            toast.error(t("share.error"), {
                                description: t("unauthorized")
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
                    onShareSuccess()
                    break;
                }
            }

            setIsSubmitting(false);
        }).catch(() => {
            setIsSubmitting(false);
        })
    }

    return (
        <AppDialog
            open={open}
            onOpenChange={onOpenChange}>
            <AppDialogContent>
                <AppDialogHeader>
                    <AppDialogTitle>
                        {t("Share document")}
                    </AppDialogTitle>
                </AppDialogHeader>
                <div className="flex flex-col max-h-[70vh]">
                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 min-h-0">
                        <LogoSection
                            title={t("share.document")}
                            description={document.fileName || '-'}
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
                                            className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 rounded-full px-3 py-1.5">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold">
                                                {getInitials(data.userName || "")}
                                            </div>
                                            <span className="text-sm font-medium">{data.userName}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCollaborator(data)}
                                                disabled={isSubmitting}
                                                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors disabled:opacity-50">
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
                </div>
                <AppDialogFooter>
                    <AppButton
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            onOpenChange?.(false)
                        }}>
                        {t("common.cancel")}
                    </AppButton>
                    <AppButton
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={handleSubmit}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? t("share.sending") : t("share.send")}
                    </AppButton>
                </AppDialogFooter>
            </AppDialogContent>
        </AppDialog>
    )
}

export default ShareDocumentDialog;