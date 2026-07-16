import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { GeneratorPage } from "../features/generator/GeneratorPage";
import { HistoryPage } from "../features/history/HistoryPage";
import { ProblemWorkspacePage } from "../features/workspace/ProblemWorkspacePage";

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/generate" element={<GeneratorPage />} />
        <Route path="/problem/:id" element={<ProblemWorkspacePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return <AppRoutes />;
}
