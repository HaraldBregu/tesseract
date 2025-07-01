import React, { useEffect } from "react";
import {
  RouterProvider,
  Outlet,
  createHashRouter,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./i18n";
import AppTabs from "./views/AppTabs";
import About from "./pages/About";
import FileViewer from "./pages/FileViewer";
import { Editor } from "./pages/editor/ELayout";
import PreferencesModal from "./pages/preferences/PreferencesPanelView";

const toolbar: Route = "/browser-tab-bar";
const root: Route = "/";
const fileViewer: Route = "/file-viewer";
const about: Route = "/about";
const preferences: Route = "/preferences";

const ProtectedRoutes = () => {
  return <Outlet />
};

const router = createHashRouter([
  {
    element: <AppTabs />,
    path: toolbar,
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
        element: <PreferencesModal />,
        path: preferences,
      },
    ]
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <About />,
        path: about,
      },
    ]
  },
]);

const App: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on('language-changed', (_: unknown, lang: string) => {
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
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
