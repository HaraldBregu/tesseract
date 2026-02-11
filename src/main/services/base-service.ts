import { readFileSync } from 'node:fs';
import { deleteBaseAuthToken, deleteUser, saveBaseAuthToken, saveUser } from "../store";
import { userAuthentication } from './base/auth';
import { UserIpcEvent } from '../types';
import path from 'node:path';
import { mainLogger } from '../shared/logger';

const baseUrl = import.meta.env.VITE_API_BASE_URL

export const login = (
    data: LoginDataInput,
    onChange: (status: UserIpcEvent) => void,
): Promise<Result<LoginSuccess, LoginError>> =>
    new Promise((resolve, reject) => {
        const url = `${baseUrl}/user/login`
        const { email, password } = data
        mainLogger.info("[USER_API]", `Login from ${url}`);

        const body = JSON.stringify({
            userEmail: email,
            password: password
        })

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        }).then(async (response) => {
            if (!response.ok) {
                const statusCode = response.status;
                let type: LoginError['type']
                switch (statusCode) {
                    case 400:
                        type = 'INVALID_INPUT_DATA'
                        break;
                    case 401:
                        type = 'INVALID_CREDENTIALS'
                        break;
                    case 403:
                        type = 'USER_UNVERIFIED'
                        break;
                    case 404:
                        type = 'USER_NOT_FOUND'
                        break;
                    case 429:
                        type = 'MAX_ATTEMPTS_REACHED'
                        break;
                    default:
                        type = 'UNKNOWN_ERROR'
                        break;
                }

                const loginError: LoginError = { type };
                mainLogger.info("[USER_API]", `Login with error ${response.status}`);
                resolve({ success: false, error: loginError });
                return;
            }

            const responseData = await response.json() as LoginSuccess;

            const pair = `${email}:${password}`;
            const token = `Basic ${btoa(pair)}`;
            saveBaseAuthToken(token);

            const user = {
                id: responseData.userId,
                firstname: responseData.userName,
                lastname: responseData.userSurname,
                email: responseData.userEmail,
                institution: responseData.userInstitution,
                keywords: responseData.userKeywords,
            } satisfies User
            saveUser(user)

            onChange("LOGIN_SUCCESS");
            mainLogger.info("[USER_API]", `Login with success`);
            resolve({ success: true, data: responseData });
        }).catch(reject)
    });

export const getCurrentUser = (
    onChange: (status: UserIpcEvent) => void,
): Promise<Result<UserSuccess, UserError>> =>
    userAuthentication<UserSuccess, UserError>(async (token: string, user: User) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/user/id/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: UserError['type']

                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_INPUT_DATA'
                            break;
                        case 401:
                            type = 'INVALID_CREDENTIALS'
                            break;
                        case 403:
                            type = 'USER_UNVERIFIED'
                            break;
                        case 404:
                            type = 'USER_NOT_FOUND'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const loginError: UserError = { type };
                    resolve({ success: false, error: loginError });
                    return;
                }

                const responseData = await response.json() as UserSuccess;

                const user = {
                    id: responseData.id,
                    firstname: responseData.firstname,
                    lastname: responseData.lastname,
                    email: responseData.email,
                    institution: responseData.institution,
                    keywords: responseData.keywords,
                } satisfies User

                saveUser(user)

                onChange("CURRENT_USER_SUCCESS");
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    })

export const deleteCurrentUser = (
    onChange: (status: UserIpcEvent) => void,
    password: string,
): Promise<Result<DeleteCurrentUserSuccess, DeleteCurrentUserError>> =>
    userAuthentication<DeleteCurrentUserSuccess, DeleteCurrentUserError>(async (token: string, user: User) => {
        return new Promise((resolve, reject) => {
            const body = JSON.stringify({
                userId: user.id,
                password: password,
            })
            fetch(`${baseUrl}/user/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: DeleteCurrentUserError['type']

                    switch (statusCode) {
                        case 401:
                            type = "INVALID_CREDENTIALS"
                            break;
                        case 404:
                            type = 'USER_NOT_FOUND'
                            break;
                        case 500:
                            type = "INVALID_OPERATION"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const deleteCurrentUserError: DeleteCurrentUserError = { type };
                    resolve({ success: false, error: deleteCurrentUserError });
                    return;
                }

                const responseData = await response.json() as DeleteCurrentUserSuccess;

                deleteBaseAuthToken()
                deleteUser()

                onChange("DELETE_CURRENT_USER_SUCCESS");

                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    })

// Documents API

export const getDocumentWithId = (
    documentId: string,
): Promise<Result<GetSharedDocumentSuccess, GetSharedDocumentError>> =>
    userAuthentication<GetSharedDocumentSuccess, GetSharedDocumentError>(async (token) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/document/find/document/${documentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: GetSharedDocumentError['type']

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_DOCUMENT_ID"
                            break;
                        case 401:
                            type = "UNAUTHORIZED"
                            break;
                        case 404:
                            type = "DOCUMENT_NOT_FOUND"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const updateUserFailure: GetSharedDocumentError = { type };
                    resolve({ success: false, error: updateUserFailure });
                    return;
                }

                const result = await response.json();
                const responseData = result as GetSharedDocumentSuccess;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const deleteDocumentWithId = (
    documentId: string,
): Promise<Result<DeleteDocumentWithIdSuccess, DeleteDocumentWithIdError>> =>
    userAuthentication<DeleteDocumentWithIdSuccess, DeleteDocumentWithIdError>(async (token, user) => {
        return new Promise((resolve, reject) => {

            fetch(`${baseUrl}/document/delete?documentId=${documentId}&userId=${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: DeleteDocumentWithIdError['type']

                    switch (statusCode) {
                        case 400:
                            type = "MISSING_REQUIRED_PARAMS"
                            break;
                        case 401:
                        case 403:
                            type = "UNAUTHORIZED"
                            break;
                        case 404:
                            type = "DOCUMENT_NOT_FOUND"
                            break;
                        case 500:
                            type = "ERROR_DELETION_DOCUMENT"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const updateUserFailure: DeleteDocumentWithIdError = { type };
                    resolve({ success: false, error: updateUserFailure });
                    return;
                }

                const result = await response.json();
                const responseData = result as DeleteDocumentWithIdSuccess;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const getMyDocuments = (): Promise<Result<GetMyDocumentsSuccess, GetMyDocumentsError>> =>
    userAuthentication<GetMyDocumentsSuccess, GetMyDocumentsError>(async (token: string, user: User) => {
        return new Promise((resolve, reject) => {
            mainLogger.debug("[GET_MY_DOCUMENTS]", `Get my documents...`);
            fetch(`${baseUrl}/document/find/${user.id}?page=0&size=100`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: GetMyDocumentsError['type']

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_PAGINATION_PARAMS"
                            break;
                        case 401:
                            type = "UNAUTHORIZED"
                            break;
                        case 404:
                            type = "NO_DOCUMENT_FOUND"
                            break;
                        case 500:
                            type = "ERROR_RETRIEVING_DOCUMENT"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const updateUserFailure: GetMyDocumentsError = { type };
                    mainLogger.debug("[GET_MY_DOCUMENTS]", `Error getting my documents with status code: ${statusCode}`);
                    resolve({ success: false, error: updateUserFailure });
                    return;
                }

                const result = await response.json();
                const responseData = result as GetMyDocumentsSuccess;
                mainLogger.debug("[GET_MY_DOCUMENTS]", `Success getting my documents`);
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const uploadDocument = (
    filepath: string,
    documentId: string,
): Promise<Result<UploadDocumentSuccess, UploadDocumentError>> =>
    userAuthentication<UploadDocumentSuccess, UploadDocumentError>(async (token: string, user: User) => {
        const url = `${baseUrl}/document/upload?documentId=${documentId}&userId=${user.id}`
        mainLogger.info("[DOCUMENT]", `Upload document to ${url}`);

        return new Promise((resolve, reject) => {
            const fileBuffer = readFileSync(filepath);

            const filepathParsed = path.parse(filepath)
            const file = new File([fileBuffer], filepathParsed.base);
            const formData = new FormData();
            formData.append("fileToUpload", file);

            fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: formData
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: UploadDocumentError['type']

                    mainLogger.info("[DOCUMENT]", `Upload document error status code ${statusCode}`);

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_INPUT_DATA"
                            break;
                        case 401:
                            type = "UNAUTHORIZED"
                            break;
                        case 404:
                            type = "USER_NOT_FOUND"
                            break;
                        case 500:
                            type = "ERROR_UPLOADING_DOCUMENT"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }
                    const updateUserFailure: UploadDocumentError = { type };
                    resolve({ success: false, error: updateUserFailure });
                    return;
                }
                const result = await response.json();
                const responseData = result as UploadDocumentSuccess;
                mainLogger.info("[DOCUMENT]", `Upload document success`);
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const sendInvites = (
    data: SendInvitesDataInput,
): Promise<Result<SendInvitesSuccess, SendInvitesError>> =>
    userAuthentication<SendInvitesSuccess, SendInvitesError>(async (token: string, user: User) => {
        const url = `${baseUrl}/invite/send`
        mainLogger.info("[INVITATION]", `Send invites from url: ${url}`);

        return new Promise((resolve, reject) => {
            const inputData = {
                ...data,
                docOwnerUserId: user.id,
            };

            const body = JSON.stringify(inputData);
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: SendInvitesError['type']

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_INPUT_DATA"
                            break;
                        case 401:
                            type = "UNAUTHORIZED"
                            break;
                        case 403:
                            type = "NO_PERMISSION"
                            break;
                        case 404:
                            type = "USER_OR_DOCUMENT_NOT_FOUND"
                            break;
                        case 500:
                            type = "INTERNAL_SERVER_ERROR"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const updateUserFailure: SendInvitesError = { type };
                    mainLogger.info("[INVITATION]", `Send invites with error ${response.status}`);
                    resolve({ success: false, error: updateUserFailure });
                    return;
                }

                const result = await response.json();
                const responseData = result as SendInvitesSuccess;
                mainLogger.info("[INVITATION]", `Send invites with success`);
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const uploadDocumentIfNotExists = (
    filepath: string,
    documentId: string,
): Promise<Result<UploadDocumentIfNotExistsSuccess, UploadDocumentIfNotExistsError>> =>
    new Promise((resolve, reject) => {
        getDocumentWithId(documentId)
            .then((response) => {
                if (response.success) {
                    resolve({ success: true, data: response.data });
                    return;
                } else if (response.error && response.error.type !== "DOCUMENT_NOT_FOUND") {
                    resolve({ success: false, error: response.error });
                    return;
                }

                uploadDocument(filepath, documentId)
                    .then((response: Result<UploadDocumentSuccess, UploadDocumentError>) => {
                        if (!response.success) {
                            resolve({ success: false, error: response.error });
                            return;
                        }
                        const data = response.data
                        resolve({ success: true, data: data });
                    })
                    .catch(reject)
            })
            .catch(reject)
    })

export const uploadDocumentIfNotExistsAndSendInvites = (
    data: UploadDocumentAndSendInvitesInput,
): Promise<Result<UploadDocumentAndSendInvitesSuccess, UploadDocumentAndSendInvitesError>> => {
    return new Promise((resolve, reject) => {
        uploadDocumentIfNotExists(data.filepath, data.documentId)
            .then((response) => {
                if (!response.success) {
                    resolve({ success: false, error: response.error });
                    return;
                }

                resolve(sendInvites({
                    documentId: data.documentId,
                    invitedUsersIds: data.invitedUsersIds,
                    message: data.message,
                }))
            })
            .catch(reject)
    })
}

export const downloadDocument =
    (documentId: string):
        Promise<Result<DownloadDocumentSuccess, DownloadDocumentError>> =>
        userAuthentication<DownloadDocumentSuccess, DownloadDocumentError>(async (token: string, user: User) => {
            return new Promise((resolve, reject) => {
                fetch(`${baseUrl}/document/${documentId}/download?userId=${user.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': token
                    },
                }).then(async (response) => {
                    if (!response.ok) {
                        const statusCode = response.status;
                        let type: DownloadDocumentError['type']
                        switch (statusCode) {
                            case 401:
                            case 403:
                                type = "UNAUTHORIZED"
                                break;
                            case 404:
                                type = "DOCUMENT_NOT_FOUND"
                                break;
                            case 500:
                                type = "ERROR_DOWNLOADING_DOCUMENT"
                                break;
                            default:
                                type = 'UNKNOWN_ERROR'
                                break;
                        }
                        const updateUserFailure: DownloadDocumentError = { type };
                        resolve({ success: false, error: updateUserFailure });
                        return;
                    }
                    const result = await response.json();
                    const responseData = result as DownloadDocumentSuccess;
                    resolve({ success: true, data: responseData });
                }).catch(reject)
            })
        });

// Invites

export const getInvitations = (): Promise<Result<GetInvitationsSuccess, GetInvitationsError>> =>
    userAuthentication<GetInvitationsSuccess, GetInvitationsError>(async (token: string, user: User) => {
        const url = `${baseUrl}/invite/user/${user.id}?page=0&size=200`
        mainLogger.info("[INVITATION]", `Get invitations from url ${url}`);

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: GetInvitationsError['type']

                    mainLogger.info("[INVITATION]", `Get invitations error with status code ${statusCode}`);

                    switch (statusCode) {
                        case 401:
                            type = "UNAUTHORIZED"
                            break;
                        case 404:
                            type = "USER_OR_DOCUMENT_NOT_FOUND"
                            break;
                        case 500:
                            type = "INTERNAL_SERVER_ERROR"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }
                    const errorObject: GetInvitationsError = { type };
                    resolve({ success: false, error: errorObject });
                    return;
                }
                const result = await response.json();
                const responseData = result as GetInvitationsSuccess;
                mainLogger.info("[INVITATION]", `Get invitations with success`);
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const resendInvitationWithId = (invitationId: string): Promise<Result<ResendInvitationWithIdSuccess, ResendInvitationWithIdError>> =>
    userAuthentication<ResendInvitationWithIdSuccess, ResendInvitationWithIdError>(async (token: string) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/invite/resend/${invitationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: ResendInvitationWithIdError['type']

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_STATUS_RESEND"
                            break;
                        case 401:
                        case 403:
                            type = "UNAUTHORIZED"
                            break;
                        case 404:
                            type = "INVITE_NOT_FOUND"
                            break;
                        case 500:
                            type = "INTERNAL_SERVER_ERROR"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }
                    const errorObject: ResendInvitationWithIdError = { type };
                    resolve({ success: false, error: errorObject });
                    return;
                }
                const result = await response.json();
                const responseData = result as ResendInvitationWithIdSuccess;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const revokeInvitationWithId = (invitationId: string): Promise<Result<RevokeInvitationWithIdSuccess, RevokeInvitationWithIdError>> =>
    userAuthentication<RevokeInvitationWithIdSuccess, RevokeInvitationWithIdError>(async (token: string) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/invite/revoke/${invitationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: RevokeInvitationWithIdError['type']

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_STATUS_REVOKE"
                            break;
                        case 401:
                        case 403:
                            type = "UNAUTHORIZED"
                            break;
                        case 404:
                            type = "INVITE_NOT_FOUND"
                            break;
                        case 500:
                            type = "INTERNAL_SERVER_ERROR"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }
                    const errorObject: RevokeInvitationWithIdError = { type };
                    resolve({ success: false, error: errorObject });
                    return;
                }
                const result = await response.json();
                const responseData = result as RevokeInvitationWithIdSuccess;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const acceptInvitationWithId = (invitationId: string): Promise<Result<AcceptInvitationWithIdSuccess, AcceptInvitationWithIdError>> =>
    userAuthentication<AcceptInvitationWithIdSuccess, AcceptInvitationWithIdError>(async (token: string) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/invite/accept/${invitationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: AcceptInvitationWithIdError['type']

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_STATUS_REVOKE"
                            break;
                        case 401:
                        case 403:
                            type = "UNAUTHORIZED"
                            break;
                        case 404:
                            type = "INVITE_NOT_FOUND"
                            break;
                        case 500:
                            type = "INTERNAL_SERVER_ERROR"
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }
                    const errorObject: AcceptInvitationWithIdError = { type };
                    resolve({ success: false, error: errorObject });
                    return;
                }
                const result = await response.json();
                const responseData = result as AcceptInvitationWithIdSuccess;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const declineInvitationWithId =
    (invitationId: string):
        Promise<Result<DeclineInvitationWithIdSuccess, DeclineInvitationWithIdError>> =>
        userAuthentication<DeclineInvitationWithIdSuccess, DeclineInvitationWithIdError>(async (token: string) => {
            return new Promise((resolve, reject) => {
                fetch(`${baseUrl}/invite/decline/${invitationId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': token
                    },
                }).then(async (response) => {
                    if (!response.ok) {
                        const statusCode = response.status;
                        let type: DeclineInvitationWithIdError['type']

                        switch (statusCode) {
                            case 400:
                                type = "INVALID_STATUS_REVOKE"
                                break;
                            case 401:
                            case 403:
                                type = "UNAUTHORIZED"
                                break;
                            case 404:
                                type = "INVITE_NOT_FOUND"
                                break;
                            case 500:
                                type = "INTERNAL_SERVER_ERROR"
                                break;
                            default:
                                type = 'UNKNOWN_ERROR'
                                break;
                        }
                        const errorObject: DeclineInvitationWithIdError = { type };
                        resolve({ success: false, error: errorObject });
                        return;
                    }
                    const result = await response.json();
                    const responseData = result as DeclineInvitationWithIdSuccess;
                    resolve({ success: true, data: responseData });
                }).catch(reject)
            })
        });

// #region Notifications

export const getNotifications = (page: number = 0): Promise<NotificationResponse> =>
    userAuthentication<NotificationResponse, GetNotificationsError>(async (token: string, user: User) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/notification/recipient/${user.id}?page=${page}&size=20`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: GetNotificationsError['type']

                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_USER_ID'
                            break;
                        case 401:
                            type = 'UNAUTHORIZED'
                            break;
                        case 404:
                            type = 'USER_NOT_FOUND'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const error: GetNotificationsError = { type };
                    resolve({ success: false, error });
                    return;
                }

                const responseData = await response.json() as NotificationResponse;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    }).then((result) => {
        if (result.success) {
            return result.data;
        }
        return { content: [], page: { size: 0, number: 0, totalElements: 0, totalPages: 0 } };
    });

export const markAsViewed = (
    notificationId: string
): Promise<NotificationItem | null> =>
    userAuthentication<NotificationItem, MarkAsViewedError>(async (token: string) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/notification/update/${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: MarkAsViewedError['type']

                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_NOTIFICATION_ID'
                            break;
                        case 401:
                            type = 'UNAUTHORIZED'
                            break;
                        case 404:
                            type = 'NOTIFICATION_NOT_FOUND'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const error: MarkAsViewedError = { type };
                    resolve({ success: false, error });
                    return;
                }

                const responseData = await response.json() as NotificationItem;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    }).then((result) => {
        if (result.success) {
            return result.data;
        }
        return null;
    });

export const markAllAsViewed = async (
    notificationIds: string[]
): Promise<NotificationItem[]> => {
    const results = await Promise.all(
        notificationIds.map((id) => markAsViewed(id))
    );
    return results.filter((item): item is NotificationItem => item !== null);
};

// #endregion
