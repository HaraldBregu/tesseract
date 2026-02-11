import { mainLogger } from '../shared/logger';
import { deleteBaseAuthToken, deleteUser, getBaseAuthToken, getUser, saveUser } from '../store';
import { UserIpcEvent } from '../types';
import { deleteCurrentUser, getCurrentUser, login } from './base-service';

const baseUrl = import.meta.env.VITE_API_BASE_URL

const baseAuthTokenExists = (): boolean => {
    const baseAuthToken = getBaseAuthToken()
    return baseAuthToken !== null && baseAuthToken !== undefined
}

export const handleUserIpc = (ipcMain: Electron.IpcMain, onChange: (status: UserIpcEvent) => void): void => {

    ipcMain.handle('user:login', (_, data: LoginDataInput):
        Promise<Result<LoginSuccess, LoginError>> =>
        login(data, onChange))

    ipcMain.handle('user:loggedIn', ():
        boolean =>
        baseAuthTokenExists())

    ipcMain.handle('user:currentUser', ():
        User | null =>
        getUser())

    ipcMain.handle('user:getCurrentUser', ():
        Promise<Result<UserSuccess, UserError>> =>
        getCurrentUser(onChange))

    ipcMain.handle('user:logout', (): void => {
        deleteBaseAuthToken()
        deleteUser()
        onChange("LOGOUT_SUCCESS")
    })

    ipcMain.handle('user:requestResetPassword', (_, data: RequestResetPasswordDataInput): Promise<Result<RequestResetPasswordSuccess, RequestResetPasswordError>> => {
        return new Promise((resolve, reject) => {
            const body = JSON.stringify(data)
            console.log("user:requestResetPassword body", body);
            fetch(`${baseUrl}/password/forgot-password/request/code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body
            }).then(async (response) => {
                if (!response.ok) {
                    console.log("Response requestResetPassword", (await response.json()));
                    const statusCode = response.status;
                    let type: RequestResetPasswordError['type']

                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_EMAIL'
                            break;
                        case 404:
                            type = 'USER_NOT_FOUND'
                            break;
                        case 429:
                            type = 'MAXIMUM_REQUESTS_REACHED'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const loginError: RequestResetPasswordError = { type };
                    resolve({ success: false, error: loginError });
                    return;
                }

                const responseData = await response.json() as RequestResetPasswordSuccess;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    })

    ipcMain.handle('user:register', async (_, data: RegisterDataInput): Promise<Result<RegistrationSuccess, RegistrationError>> => {
        return new Promise((resolve, reject) => {
            const body = JSON.stringify(data)
            mainLogger.info("user:register body", body);
            fetch(`${baseUrl}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body
            }).then(async (response) => {
                mainLogger.info("Registration user response status:", response.status.toString())
                if (!response.ok) {
                    console.log("Response not ok", (await response.json()));
                    const statusCode = response.status;
                    let type: RegistrationError['type']

                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_INPUT_DATA'
                            break;
                        case 403:
                            type = 'EMAIL_NOT_VERIFIED'
                            break;
                        case 409:
                            type = 'EMAIL_ALREADY_EXISTS'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const registrationError: RegistrationError = { type };
                    resolve({ success: false, error: registrationError });
                    return;
                }

                const responseData = await response.json() as RegistrationSuccess;

                onChange("REGISTRATION_SUCCESS");
                resolve({ success: true, data: responseData });
            }).catch(reject)
        });
    })

    ipcMain.handle('user:sendVerificationCode', (_, data: SendVerificationCodeDataInput): Promise<Result<SendVerificationCodeSuccess, SendVerificationCodeError>> => {
        return new Promise((resolve, reject) => {
            console.log("user:sendVerificationCode:", (data));

            fetch(`${baseUrl}/user/email/resend-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).then(async (response) => {
                if (!response.ok) {
                    console.log("Response send verification code not ok", (await response.json()));
                    const statusCode = response.status;
                    let type: SendVerificationCodeError['type']

                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_EMAIL_FORMAT'
                            break;
                        case 404:
                            type = 'USER_NOT_FOUND_OR_VERIFIED'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const sendVerificationCodeError: SendVerificationCodeError = { type };
                    resolve({ success: false, error: sendVerificationCodeError });
                    return;
                }

                const responseData = await response.json() as SendVerificationCodeSuccess;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    })

    ipcMain.handle('user:verifyuser', async (_, data: VerifyUserDataInput): Promise<Result<VerifyUserSuccess, VerifyUserError>> => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/user/email/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).then(async (response) => {
                mainLogger.info("Verify user response status:", response.status.toString())
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: VerifyUserError['type']

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_EMAIL_OR_USER_NOT_FOUND"
                            break;
                        case 401:
                        case 403:
                        case 422:
                            type = 'INVALID_CODE'
                            break;
                        case 404:
                            type = 'USER_NOT_FOUND'
                            break;
                        default:
                            type = 'INVALID_CODE'
                            break;
                    }

                    mainLogger.info("Verify user error type:", type)
                    const verifyUserError: VerifyUserError = { type };
                    resolve({ success: false, error: verifyUserError });
                    return;
                }

                const responseData = await response.json() as VerifyUserSuccess;

                onChange("REGISTRATION_SUCCESS");
                resolve({ success: true, data: responseData });
            }).catch(reject)
        });
    })

    ipcMain.handle('user:resetPassword', (_, data: ResetPasswordDataInput) => {
        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/password/forgot-password/change`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).then(async (response) => {
                if (!response.ok) {
                    console.log("Response reset password not ok", (await response.json()));
                    const statusCode = response.status;
                    let type: ResetPasswordError['type']
                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_INPUT_DATA'
                            break;
                        case 401:
                            type = 'EXPIRED_RESET_CODE'
                            break;
                        case 404:
                            type = 'USER_NOT_FOUND'
                            break;
                        case 500:
                            type = 'INVALID_OPERATION'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }
                    const resetPasswordError: ResetPasswordError = { type };
                    resolve({ success: false, error: resetPasswordError });
                    return;
                }
                const responseData = await response.json() as ResetPasswordSuccess;
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    })

    ipcMain.handle('user:changePassword', (_, data: ChangePasswordDataInput): Promise<Result<ChangePasswordSuccess, ChangePasswordError>> => {
        const baseAuthToken = getBaseAuthToken() || ''
        const user = getUser()
        const userId = user?.id || ''

        return new Promise((resolve, reject) => {
            const inputData = { ...data, userId }

            fetch(`${baseUrl}/password/change`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': baseAuthToken
                },
                body: JSON.stringify(inputData)
            }).then(async (response) => {
                console.log(response)
                if (!response.ok) {
                    const statusCode = response.status;
                    let type: ChangePasswordError['type']

                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_INPUT_DATA'
                            break;
                        case 401:
                            type = 'UNAUTHORIZED'
                            break;
                        case 404:
                            type = 'USER_NOT_FOUND'
                            break;
                        case 429:
                            type = 'MAXIMUM_REQUESTS_REACHED'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const changePasswordFailure: ChangePasswordError = { type };
                    resolve({ success: false, error: changePasswordFailure });
                    return;
                }

                const responseData = await response.json() as ChangePasswordSuccess;

                onChange("CHANGE_PASSWORD_SUCCESS");
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    })

    ipcMain.handle('user:updateUser', (_, data: UpdateUserDataInput): Promise<Result<UpdateUserSuccess, UpdateUserError>> => {
        const baseAuthToken = getBaseAuthToken() || ''
        const user = getUser()
        const userId = user?.id

        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/user/${userId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': baseAuthToken
                },
                body: JSON.stringify(data)
            }).then(async (response) => {

                if (!response.ok) {
                    const statusCode = response.status;
                    let type: UpdateUserError['type']

                    switch (statusCode) {
                        case 400:
                            type = 'INVALID_INPUT_DATA'
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

                    const updateUserFailure: UpdateUserError = { type };
                    resolve({ success: false, error: updateUserFailure });
                    return;
                }

                const responseData = await response.json() as UpdateUserSuccess;

                onChange("UPDATE_USER_SUCCESS");
                resolve({ success: true, data: responseData });

                const currentUser = getUser()
                if (!currentUser)
                    return;

                saveUser({
                    ...currentUser,
                    firstname: responseData.userName,
                    lastname: responseData.userSurname,
                    institution: responseData.userInstitution || '',
                    keywords: responseData.userKeywords || [],
                })
            }).catch(reject)
        })
    })

    ipcMain.handle('user:deleteCurrentUser', (_, password: string):
        Promise<Result<DeleteCurrentUserSuccess, DeleteCurrentUserError>> =>
        deleteCurrentUser(onChange, password))

    ipcMain.handle('user:searchUsers', (_, data: SearchUserDataInput): Promise<Result<SearchUserSuccess[], SearchUserError>> => {
        const baseAuthToken = getBaseAuthToken() || ''

        return new Promise((resolve, reject) => {
            fetch(`${baseUrl}/user/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': baseAuthToken
                },
                body: JSON.stringify(data)
            }).then(async (response) => {

                if (!response.ok) {
                    const statusCode = response.status;
                    let type: SearchUserError['type']

                    switch (statusCode) {
                        case 400:
                            type = "INVALID_SEARCH_PARAMS"
                            break;
                        case 401:
                            type = 'UNAUTHORIZED'
                            break;
                        default:
                            type = 'UNKNOWN_ERROR'
                            break;
                    }

                    const updateUserFailure: SearchUserError = { type };
                    resolve({ success: false, error: updateUserFailure });
                    return;
                }

                const responseData = await response.json() as {
                    content: SearchUserSuccess[],
                    page: number,
                };
                resolve({ success: true, data: responseData.content });
            }).catch(reject)
        })

    })
}