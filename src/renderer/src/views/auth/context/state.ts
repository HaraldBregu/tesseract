import { AuthFlow, AuthRoute } from "./types";

export interface AuthContextState {
  currentFlow: AuthFlow;
  currentRoute: AuthRoute;
  email: string | null
  code: string | null
}

export const initialState: AuthContextState = {
  currentFlow: "SIGNIN",
  currentRoute: "SIGNIN",
  email: null,
  code: null,
};