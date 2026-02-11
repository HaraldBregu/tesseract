/**
 * Mock data for notifications testing
 * Use when backend services are unavailable
 */

export const mockNotifications: NotificationItem[] = [
    {
        notificationId: "notif-001",
        notificationOwnerId: "user-001",
        documentOwnerId: "user-current",
        documentId: "doc-001",
        recipientUserId: "user-current",
        notificationEventId: 6, // accept_invitation
        notificationTitle: "[MOCK] Collaboration accepted",
        ownerMessage: null,
        recipientMessage: "Luca Verdi accepted your invitation. You can now collaborate.",
        viewedDate: null,
        creationDate: "2026-03-15T10:15:00.000Z",
        emailSend: true,
        ownerName: "Luca",
        ownerSurname: "Verdi",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Research methodology paper.critx",
        senderRole: "Collaborator",
    },
    {
        notificationId: "notif-002",
        notificationOwnerId: "user-002",
        documentOwnerId: "user-current",
        documentId: "doc-002",
        recipientUserId: "user-current",
        notificationEventId: 8, // download
        notificationTitle: "[MOCK] Downloaded",
        ownerMessage: null,
        recipientMessage: "Maria Conti downloaded the document. You can revoke access if needed.",
        viewedDate: null,
        creationDate: "2026-03-15T09:45:00.000Z",
        emailSend: true,
        ownerName: "Maria",
        ownerSurname: "Conti",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Historical analysis vol. 2.critx",
        senderRole: "Collaborator",
    },
    {
        notificationId: "notif-003",
        notificationOwnerId: "user-003",
        documentOwnerId: "user-current",
        documentId: "doc-003",
        recipientUserId: "user-current",
        notificationEventId: 9, // download_new_version
        notificationTitle: "[MOCK] Downloaded new version",
        ownerMessage: null,
        recipientMessage: "Laura Bianchi downloaded the latest version of the document.",
        viewedDate: null,
        creationDate: "2026-03-15T08:30:00.000Z",
        emailSend: true,
        ownerName: "Laura",
        ownerSurname: "Bianchi",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Critical edition manuscript.critx",
        senderRole: "Collaborator",
    },
    {
        notificationId: "notif-004",
        notificationOwnerId: "user-004",
        documentOwnerId: "user-current",
        documentId: "doc-004",
        recipientUserId: "user-current",
        notificationEventId: 7, // decline_invitation
        notificationTitle: "[MOCK] Invitation declined",
        ownerMessage: null,
        recipientMessage: "Marco Rossi declined your invitation. No further action needed.",
        viewedDate: null,
        creationDate: "2026-03-14T16:20:00.000Z",
        emailSend: true,
        ownerName: "Marco",
        ownerSurname: "Rossi",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Philological notes.critx",
        senderRole: "Collaborator",
    },
    {
        notificationId: "notif-005",
        notificationOwnerId: "user-005",
        documentOwnerId: "user-005",
        documentId: "doc-005",
        recipientUserId: "user-current",
        notificationEventId: 1, // send_invitation
        notificationTitle: "[MOCK] Shared with you",
        ownerMessage: null,
        recipientMessage: "Shared with you by Giorgio D'Angelo.",
        viewedDate: "2026-03-14T14:00:00.000Z",
        creationDate: "2026-03-14T12:00:00.000Z",
        emailSend: true,
        ownerName: "Giorgio",
        ownerSurname: "D'Angelo",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Medieval manuscripts collection.critx",
        senderRole: "Owner",
    },
    {
        notificationId: "notif-006",
        notificationOwnerId: "user-006",
        documentOwnerId: "user-006",
        documentId: "doc-006",
        recipientUserId: "user-current",
        notificationEventId: 2, // resend_invitation
        notificationTitle: "[MOCK] Shared with you",
        ownerMessage: null,
        recipientMessage: "Shared with you by Elena Martini (resent).",
        viewedDate: null,
        creationDate: "2026-03-13T15:30:00.000Z",
        emailSend: true,
        ownerName: "Elena",
        ownerSurname: "Martini",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Renaissance texts analysis.critx",
        senderRole: "Owner",
    },
    {
        notificationId: "notif-007",
        notificationOwnerId: "user-007",
        documentOwnerId: "user-007",
        documentId: "doc-007",
        recipientUserId: "user-current",
        notificationEventId: 3, // revoke_access
        notificationTitle: "[MOCK] Your access has been revoked",
        ownerMessage: null,
        recipientMessage: "Your access has been revoked by Paolo Ricci.",
        viewedDate: "2026-03-12T10:00:00.000Z",
        creationDate: "2026-03-12T09:00:00.000Z",
        emailSend: true,
        ownerName: "Paolo",
        ownerSurname: "Ricci",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Greek papyrus edition.critx",
        senderRole: "Owner",
    },
    {
        notificationId: "notif-008",
        notificationOwnerId: "user-008",
        documentOwnerId: "user-008",
        documentId: "doc-008",
        recipientUserId: "user-current",
        notificationEventId: 4, // share_new_version
        notificationTitle: "[MOCK] New document version shared with you",
        ownerMessage: null,
        recipientMessage: "New document version available for download by Anna Colombo.",
        viewedDate: null,
        creationDate: "2026-03-11T14:45:00.000Z",
        emailSend: true,
        ownerName: "Anna",
        ownerSurname: "Colombo",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Latin inscriptions corpus.critx",
        senderRole: "Owner",
    },
    {
        notificationId: "notif-009",
        notificationOwnerId: "user-009",
        documentOwnerId: "user-009",
        documentId: "doc-009",
        recipientUserId: "user-current",
        notificationEventId: 5, // delete_document
        notificationTitle: "[MOCK] Document deleted",
        ownerMessage: null,
        recipientMessage: "Document deleted and collaboration ended by Roberto Ferrari. You no longer have access.",
        viewedDate: "2026-03-10T11:00:00.000Z",
        creationDate: "2026-03-10T10:30:00.000Z",
        emailSend: true,
        ownerName: "Roberto",
        ownerSurname: "Ferrari",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Deleted project.critx",
        senderRole: "Owner",
    },
    {
        notificationId: "notif-010",
        notificationOwnerId: "system",
        documentOwnerId: "user-current",
        documentId: "doc-010",
        recipientUserId: "user-current",
        notificationEventId: 10, // invitation_expired
        notificationTitle: "[MOCK] Invitation expired",
        ownerMessage: null,
        recipientMessage: "The invitation for 'Classical texts compendium.critx' expired. Please re-send if needed.",
        viewedDate: null,
        creationDate: "2026-03-09T08:00:00.000Z",
        emailSend: true,
        ownerName: "System",
        ownerSurname: "",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "Classical texts compendium.critx",
        senderRole: "System",
    },
    {
        notificationId: "notif-011",
        notificationOwnerId: "system",
        documentOwnerId: "",
        documentId: "",
        recipientUserId: "user-current",
        notificationEventId: 11, // password_changed
        notificationTitle: "[MOCK] Your Password has been changed",
        ownerMessage: null,
        recipientMessage: "Your password was successfully changed.",
        viewedDate: "2026-03-08T16:00:00.000Z",
        creationDate: "2026-03-08T15:45:00.000Z",
        emailSend: false,
        ownerName: "System",
        ownerSurname: "",
        recipientName: "Current",
        recipientSurname: "User",
        documentFile: "",
        senderRole: "System",
    },
];

/**
 * Get mock notifications with optional filtering
 */
export const getMockNotifications = (options?: {
    unreadOnly?: boolean;
    limit?: number;
}): NotificationItem[] => {
    let result = [...mockNotifications];
    
    if (options?.unreadOnly) {
        result = result.filter(n => n.viewedDate === null);
    }
    
    if (options?.limit) {
        result = result.slice(0, options.limit);
    }
    
    return result;
};

/**
 * Simulate marking a notification as viewed
 */
export const mockMarkAsViewed = (notificationId: string): NotificationItem | null => {
    const notification = mockNotifications.find(n => n.notificationId === notificationId);
    if (notification && notification.viewedDate === null) {
        notification.viewedDate = new Date().toISOString();
        return { ...notification };
    }
    return null;
};
