import { Routes, Route } from "react-router-dom";
import { PublicLayout, DashboardLayout } from "./layouts";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProfilePage,
  GroupsPage,
  CreateGroupPage,
  GroupDetailPage,
  AddExpensePage,
  SettlePaymentPage,
  NotFoundPage,
} from "./pages";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/create" element={<CreateGroupPage />} />
          <Route path="/groups/join" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/groups/:id/add-expense" element={<AddExpensePage />} />
          <Route path="/groups/:id/settle" element={<SettlePaymentPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
