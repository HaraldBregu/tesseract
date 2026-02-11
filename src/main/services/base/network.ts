import { net } from "electron";

export const networkConnection = <T, E>(
    callback: () => Promise<Result<T, E>>
): Promise<Result<T, E | NetworkError>> => {
    const online = net.isOnline()

    if (!online) {
        const error = { type: "NO_INTERNET_CONNECTION" } satisfies NetworkError
        return Promise.resolve({ success: false, error });
    }

    return callback();
}