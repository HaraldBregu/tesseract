import { AuthRoute } from './types';

export type AuthAction =
  | { type: 'SET_ROUTE'; payload: AuthRoute }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_CODE'; payload: string }

export const setRoute = (route: AuthRoute): AuthAction => ({
  type: 'SET_ROUTE',
  payload: route,
});

export const setEmail = (email: string): AuthAction => ({
  type: 'SET_EMAIL',
  payload: email,
});

export const setCode = (code: string): AuthAction => ({
  type: 'SET_CODE',
  payload: code,
});
