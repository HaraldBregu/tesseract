import { AuthAction } from './actions';
import { AuthContextState } from './state';
import { AuthFlow } from './types';

export const reducer = (
  state: AuthContextState,
  action: AuthAction
): AuthContextState => {
  switch (action.type) {
    case 'SET_ROUTE': {
      let currentRoute = state.currentRoute
      let currentFlow: AuthFlow
      if (currentRoute === "SIGNIN")
        currentFlow = "SIGNIN"
      else if (currentRoute === "SIGNUP")
        currentFlow = "SIGNUP"
      else
        currentFlow = state.currentFlow

      return {
        ...state,
        currentFlow: currentFlow,
        currentRoute: action.payload,
      };
    }
    case "SET_EMAIL":
      return {
        ...state,
        email: action.payload,
      };
    case "SET_CODE":
      return {
        ...state,
        code: action.payload,
      };
    default:
      return state;
  }
};
