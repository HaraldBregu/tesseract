import { createContext, Dispatch } from 'react';
import { AuthAction } from './actions';
import { AuthContextState, initialState } from './state';

export const AuthContext = createContext<[AuthContextState, Dispatch<AuthAction>]>([
  initialState,
  () => {},
]);

AuthContext.displayName = 'AuthContext';
