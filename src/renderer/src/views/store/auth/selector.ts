import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

const authState = (state: RootState) => state.auth;

// User selectors
export const selectUser = createSelector(
    authState,
    (auth) => auth.user.data
);

export const selectUserLoading = createSelector(
    authState,
    (auth) => auth.user.loading
);

export const selectUserError = createSelector(
    authState,
    (auth) => auth.user.error
);

// Login selectors
export const selectLoginLoading = createSelector(
    authState,
    (auth) => auth.login.loading
);

export const selectLoginError = createSelector(
    authState,
    (auth) => auth.login.error
);

export const selectLoginSuccess = createSelector(
    authState,
    (auth) => auth.login.data
);

// Logout selectors
export const selectLogoutLoading = createSelector(
    authState,
    (auth) => auth.logout.loading
);

export const selectLogoutError = createSelector(
    authState,
    (auth) => auth.logout.error
);

// Authentication status selector
export const selectIsAuthenticated = createSelector(
    authState,
    (auth) => auth.isAuthenticated
);