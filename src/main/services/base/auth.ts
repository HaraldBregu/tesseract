import { getBaseAuthToken, getUser } from "../../store";

export const userAuthentication = <T, E>(
    callback: (token: string, user: User) => Promise<Result<T, E>>
): Promise<Result<T, E | AuthenticationError | CurrentUserError>> => {
    const token = getBaseAuthToken();
    const baseAuth = token?.split(' ');
    const user = getUser();


    if (!token || baseAuth?.length !== 2) {
        const error = { type: "UNAUTHENTICATED" } satisfies AuthenticationError
        return Promise.resolve({ success: false, error });
    }


    if (!user) {
        const error = { type: "CURRENT_USER_NOT_FOUND" } satisfies CurrentUserError
        return Promise.resolve({ success: false, error });
    }

    return callback(token, user);
}