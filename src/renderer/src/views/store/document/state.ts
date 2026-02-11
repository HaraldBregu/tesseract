export interface DocumentState {
    invitations: {
        data: Invitation[];
        originalData: Invitation[];
        page: Page | null;
        loading: boolean;
        error: GetInvitationsError['type'] | null;
        filters: {
            filename: string;
            userFullName: string;
            invitationStatus: InvitationStatus | 'All';
        } | null;
    };
    myDocuments: {
        data: SharedDocument[];
        originalData: SharedDocument[];
        page: Page | null;
        loading: boolean;
        error: GetMyDocumentsError['type'] | null;
        filters: {
            filename: string;
            collaboratorFullName: string;
            invitationStatus: InvitationStatus | 'All';
        } | null;
    };
    acceptInvitation: {
        data: AcceptInvitationWithIdSuccess | null;
        loading: boolean;
        error: AcceptInvitationWithIdError['type'] | null;
        invitationId: string | null;
        loadingInviteId: string | null;
    };
    revokeInvitation: {
        data: RevokeInvitationWithIdSuccess | null;
        loading: boolean;
        error: RevokeInvitationWithIdError['type'] | null;
        invitationId: string | null;
        loadingInviteId: string | null;
    };
    declineInvitation: {
        data: DeclineInvitationWithIdSuccess | null;
        loading: boolean;
        error: DeclineInvitationWithIdError['type'] | null;
        invitationId: string | null;
        loadingInviteId: string | null;
    };
    sendInvitation: {
        data: SendInvitesSuccess | null;
        loading: boolean;
        error: SendInvitesError['type'] | null;
        documentId: string | null;
        loadingDocumentId: string | null;
    };
    resendInvitation: {
        data: ResendInvitationWithIdSuccess | null;
        loading: boolean;
        error: ResendInvitationWithIdError['type'] | null;
        invitationId: string | null;
        loadingInviteId: string | null;
    };
    deleteDocument: {
        data: DeleteDocumentWithIdSuccess | null;
        loading: boolean;
        error: DeleteDocumentWithIdError['type'] | null;
        documentId: string | null;
        loadingDocumentId: string | null;
    };
    uploadDocument: {
        data: UploadDocumentSuccess | null;
        loading: boolean;
        error: UploadDocumentError['type'] | null;
        documentId: string | null;
        loadingDocumentId: string | null;
    };
    uploadDocumentIfNotExists: {
        data: UploadDocumentIfNotExistsSuccess | null;
        loading: boolean;
        error: UploadDocumentIfNotExistsError['type'] | null;
        documentId: string | null;
        filepath: string | null;
        loadingDocumentId: string | null;
    };
    selectFolder: {
        folderPath: string | null;
        loading: boolean;
        error: string | null;
    };
    downloadDocument: {
        data: DownloadDocumentSuccess | null;
        loading: boolean;
        error: DownloadDocumentError['type'] | null;
        documentId: string | null;
        filename: string | null;
        folderPath: string | null;
        loadingDocumentId: string | null;
    };
    saveFile: {
        loading: boolean;
        error: string | null;
        success: boolean;
        folderPath: string | null;
        filepath: string | null;
        loadingDocumentId: string | null;
    };
}

export const initialState: DocumentState = {
    invitations: {
        data: [],
        originalData: [],
        page: null,
        loading: false,
        error: null,
        filters: null,
    },
    myDocuments: {
        data: [],
        originalData: [],
        page: null,
        loading: false,
        error: null,
        filters: null,
    },
    acceptInvitation: {
        data: null,
        loading: false,
        error: null,
        invitationId: null,
        loadingInviteId: null,
    },
    revokeInvitation: {
        data: null,
        loading: false,
        error: null,
        invitationId: null,
        loadingInviteId: null,
    },
    declineInvitation: {
        data: null,
        loading: false,
        error: null,
        invitationId: null,
        loadingInviteId: null,
    },
    sendInvitation: {
        data: null,
        loading: false,
        error: null,
        documentId: null,
        loadingDocumentId: null,
    },
    resendInvitation: {
        data: null,
        loading: false,
        error: null,
        invitationId: null,
        loadingInviteId: null,
    },
    deleteDocument: {
        data: null,
        loading: false,
        error: null,
        documentId: null,
        loadingDocumentId: null,
    },
    uploadDocument: {
        data: null,
        loading: false,
        error: null,
        documentId: null,
        loadingDocumentId: null,
    },
    uploadDocumentIfNotExists: {
        data: null,
        loading: false,
        error: null,
        documentId: null,
        filepath: null,
        loadingDocumentId: null,
    },
    selectFolder: {
        folderPath: null,
        loading: false,
        error: null,
    },
    downloadDocument: {
        data: null,
        loading: false,
        error: null,
        documentId: null,
        filename: null,
        folderPath: null,
        loadingDocumentId: null,
    },
    saveFile: {
        loading: false,
        error: null,
        success: false,
        folderPath: null,
        filepath: null,
        loadingDocumentId: null,
    }
};
