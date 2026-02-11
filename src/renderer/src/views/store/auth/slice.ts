import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './state';

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, _action: PayloadAction<LoginDataInput>) {
            state.login.loading = true;
            state.login.error = null;
        },

        loginSuccess(state, action: PayloadAction<LoginSuccess>) {
            state.login.loading = false;
            state.login.error = null;
            state.login.data = action.payload
            state.user.data = action.payload;
            state.isAuthenticated = true;
        },

        loginFailure(state, action: PayloadAction<LoginError['type']>) {
            state.login.loading = false;
            state.login.error = action.payload;
            state.isAuthenticated = false;
        },

        clearLogin(state) {
            state.login = initialState.login
        },

        logout(state) {
            state.logout.loading = true;
            state.logout.error = null;
        },

        logoutSuccess(state) {
            state.logout.loading = false;
            state.logout.error = null;
            state.user.data = null;
            state.isAuthenticated = false;
        },

        logoutFailure(state, action: PayloadAction<string>) {
            state.logout.loading = false;
            state.logout.error = action.payload;
        },

        fetchUser(state) {
            state.user.loading = true;
            state.user.error = null;
        },

        fetchUserSuccess(state, _action: PayloadAction<UserSuccess>) {
            // state.user.data = {
            //     userId: action.payload.id,
            //     userEmail: action.payload.email,
            //     userName: action.payload.firstname,
            //     userSurname: action.payload.lastname,
            //     userInstitution: action.payload.institution,
            //     verificationStatus: 'Verified',
            //     creationDate: '',
            //     lastUpdateDate: '',
            //     lastAccessDate: '',
            //     policyAcceptedDate: '',
            // };
            state.user.loading = false;
            state.user.error = null;
            state.isAuthenticated = true;
        },

        fetchUserFailure(state, _action: PayloadAction<UserError['type']>) {
            state.user.loading = false;
            state.isAuthenticated = false;
        },

        clearAuthErrors(state) {
            state.login.error = null;
            state.logout.error = null;
            state.user.error = null;
        },
    },
});

export const {
    login,
    loginSuccess,
    loginFailure,
    clearLogin,
    logout,
    logoutSuccess,
    logoutFailure,
    fetchUser,
    fetchUserSuccess,
    fetchUserFailure,
    clearAuthErrors,
} = authSlice.actions;

export default authSlice.reducer;