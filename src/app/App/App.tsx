import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/common/ProtectedRoute/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout/AppLayout";
import { LoginPage } from "@/pages/LoginPage/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage/RegisterPage";
import { DrivePage } from "@/pages/DrivePage/DrivePage";
import { SharedPage } from "@/pages/SharedPage/SharedPage";
import { NotFoundPage } from "@/pages/NotFoundPage/NotFoundPage";

import "./App.scss";
export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/drive" element={<DrivePage />} />
          <Route path="/compartilhados" element={<SharedPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/drive" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
