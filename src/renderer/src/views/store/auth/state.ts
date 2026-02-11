export interface AuthState {
    user: {
        data: LoginSuccess | null;
        loading: boolean;
        error: LoginError['type'] | null;
    };
    login: {
        data: LoginSuccess | null;
        loading: boolean;
        error: LoginError['type'] | null;
    };
    logout: {
        loading: boolean;
        error: string | null;
    };
    isAuthenticated: boolean;
}

export const initialState: AuthState = {
    user: {
        data: null,
        loading: false,
        error: null,
    },
    login: {
        data: null,
        loading: false,
        error: null,
    },
    logout: {
        loading: false,
        error: null,
    },
    isAuthenticated: false,
};