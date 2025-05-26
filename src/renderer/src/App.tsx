import React, { useEffect } from "react";
import {
  RouterProvider,
  Outlet,
  createHashRouter,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./i18n";
import { ELayout } from "./pages/editor/ELayout";
import AppTabs from "./AppTabs";
import About from "./pages/about";

const ProtectedRoutes = () => {
  return <Outlet />
};

const router = createHashRouter([
  {
    element: <AppTabs />,
    path: "/browser-tab-bar",
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <ELayout />,
        path: "/",
      },
    ]
  },
]);

const App: React.FC = () => {
  const [showAbout, setShowAbout] = React.useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!window.electron) return;

    const showAboutCleanup = window.electron.ipcRenderer.on('show-about', () => {
      setShowAbout(true);
    });

    return () => {
      showAboutCleanup();
    }
  }, [window.electron]);

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on('language-changed', (_: unknown, lang: string) => {
      console.log("Language changed to: ", lang);
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
      <About isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
};

export default App;
