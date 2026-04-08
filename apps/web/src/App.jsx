import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RulesPage from "./pages/RulesPage";
import TicketsPage from "./pages/TicketsPage";
import ExecutionsPage from "./pages/ExecutionsPage";
import EventsPage from "./pages/EventsPage";
import UsersPage from "./pages/UsersPage";
import DemoPage from "./pages/DemoPage";
import RoleRoute from "./components/RoleRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rules"
            element={
              <ProtectedRoute>
                <Layout>
                  <RulesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Layout>
                  <TicketsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/executions"
            element={
              <ProtectedRoute>
                <ExecutionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/demo"
            element={
              <ProtectedRoute>
                <DemoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/demo"
            element={
              <RoleRoute roles={["admin", "manager"]}>
                <DemoPage />
              </RoleRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleRoute roles={["admin"]}>
                <UsersPage />
              </RoleRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
