// import { useTranslation } from "react-i18next";
// import { Check, X, Download, Loader2 } from "lucide-react";
// import AppButton from "@/components/app/app-button";

// export interface SharedFileRowActionsProps {
//     file: SharedWithMeFile;
//     loadingActions: Record<string, boolean>;
//     onAccept: (fileId: string) => void;
//     onDecline: (fileId: string) => void;
//     onDownload: (fileId: string, isNewVersion: boolean) => void;
// }

// export function SharedFileRowActions({
//     file,
//     loadingActions,
//     onAccept,
//     onDecline,
//     onDownload,
// }: Readonly<SharedFileRowActionsProps>) {
//     const { t } = useTranslation();
//     const isLoading = (key: string) => loadingActions[key];

//     if (file.invitationStatus === "Pending") {
//         return (
//             <div className="flex items-center gap-2">
//                 <AppButton
//                     variant="success"
//                     size="xs"
//                     onClick={() => onAccept(file.id)}
//                     disabled={isLoading(`accept-${file.id}`)}
//                 >
//                     {isLoading(`accept-${file.id}`) ? (
//                         <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
//                     ) : (
//                         <Check className="h-3.5 w-3.5 mr-1" />
//                     )}
//                     {t("sharedFiles.accept")}
//                 </AppButton>
//                 <AppButton
//                     variant="destructive"
//                     size="xs"
//                     onClick={() => onDecline(file.id)}
//                     disabled={isLoading(`decline-${file.id}`)}
//                 >
//                     {isLoading(`decline-${file.id}`) ? (
//                         <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
//                     ) : (
//                         <X className="h-3.5 w-3.5 mr-1" />
//                     )}
//                     {t("sharedFiles.decline")}
//                 </AppButton>
//             </div>
//         );
//     }

//     if (file.invitationStatus === "Accepted") {
//         if (file.hasNewVersion) {
//             return (
//                 <AppButton
//                     variant="warning"
//                     size="xs"
//                     onClick={() => onDownload(file.id, true)}
//                     disabled={isLoading(`download-new-${file.id}`)}
//                 >
//                     {isLoading(`download-new-${file.id}`) ? (
//                         <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
//                     ) : (
//                         <Download className="h-3.5 w-3.5 mr-1" />
//                     )}
//                     {t("sharedFiles.downloadNewVersion")}
//                 </AppButton>
//             );
//         }
//         return (
//             <AppButton
//                 variant="success"
//                 size="xs"
//                 onClick={() => onDownload(file.id, false)}
//                 disabled={isLoading(`download-${file.id}`)}
//             >
//                 {isLoading(`download-${file.id}`) ? (
//                     <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
//                 ) : (
//                     <Download className="h-3.5 w-3.5 mr-1" />
//                 )}
//                 {t("sharedFiles.download")}
//             </AppButton>
//         );
//     }

//     // declined, expired, revoked
//     return (
//         <span className="text-sm text-muted-foreground italic">
//             {t("sharedFiles.noActionsAvailable")}
//         </span>
//     );
// }
