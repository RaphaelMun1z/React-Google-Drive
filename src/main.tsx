import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { App } from "@/app/App/App";
import { AuthProvider } from "@/contexts/AuthContext";
import { DriveProvider } from "@/contexts/DriveContext";
import "@/styles/global.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DriveProvider>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </DriveProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
