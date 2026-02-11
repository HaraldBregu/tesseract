import React, { useEffect, Suspense } from "react";
import {
  RouterProvider,
  Outlet,
  createHashRouter,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import "./i18n";
import AppTabs from "./views/AppTabs";
import Editor from "./pages/editor";
import FileViewer from "./views/FileViewer";
import WelcomeView from "./views/WelcomeView";

const toolbar: Route = "/browser-tab-bar";
const root: Route = "/";
const fileViewer: Route = "/file-viewer";
const welcome: Route = "/welcome";
const about: Route = "/about";
const findAndReplace: Route = "/find_and_replace";
const preferences: Route = "/preferences";
const keyboardShortcuts: Route = "/keyboard-shortcuts";
const auth: Route = "/auth";
const logout: Route = "/logout";
const shareDocument: Route = "/share-document";
const sharedFiles: Route = "/shared-files";

const ProtectedRoutes = () => {
  return <Outlet />
};

// Lazy loaded components (secondary windows/modals only)
const PreferencesModalLazy = React.lazy(() => import("./views/PreferencesPanelView"));
const AboutLazy = React.lazy(() => import("./views/About"));
const FindAndReplaceLazy = React.lazy(() => import("./views/FindAndReplace"));
const KeyboardShortcutsLazy = React.lazy(() => import("./views/KeyboardShortcutsWindowView"));
const AuthLazy = React.lazy(() => import("./views/auth/Auth"));
const LogoutLazy = React.lazy(() => import("./views/Logout"));
const ShareDocumentLazy = React.lazy(() => import("./views/ShareDocument"));
const SharedDocumentsLazy = React.lazy(() => import("./views/SharedDocuments"));

const router = createHashRouter([
  {
    element: <AppTabs />,
    path: toolbar,
  },
  {
    element: <WelcomeView />,
    path: welcome,
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <Editor />,
        path: root,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <FileViewer />,
        path: fileViewer,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <PreferencesModalLazy />,
        path: preferences,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <AboutLazy />,
        path: about,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <FindAndReplaceLazy />,
        path: findAndReplace,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <KeyboardShortcutsLazy />,
        path: keyboardShortcuts,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <AuthLazy />,
        path: auth,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <LogoutLazy />,
        path: logout,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <ShareDocumentLazy />,
        path: shareDocument,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <SharedDocumentsLazy />,
        path: sharedFiles,
      },
    ]
  }
]);

const App: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const unsubscribe = globalThis.electron.ipcRenderer.on('language-changed', (_: unknown, lang: string) => {
      i18n.changeLanguage(lang);
      localStorage.setItem("appLanguage", lang);
    });

    const savedLanguage = localStorage.getItem("appLanguage");

    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }

    return unsubscribe;
  }, [i18n]);

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
