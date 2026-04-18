import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RulesPage from "./pages/RulesPage";
import TicketsPage from "./pages/TicketsPage";
import ExecutionsPage from "./pages/ExecutionsPage";
import EventsPage from "./pages/EventsPage";
import UsersPage from "./pages/UsersPage";
import DemoPage from "./pages/DemoPage";
import JobsPage from "./pages/jobsPage";

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
            path="/rules"
            element={
              <RoleRoute roles={["manager", "admin"]}>
                <Layout>
                  <RulesPage />
                </Layout>
              </RoleRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <RoleRoute roles={["admin"]}>
                <Layout>
                  <JobsPage />
                </Layout>
              </RoleRoute>
            }
          />

          <Route
            path="/executions"
            element={
              <RoleRoute roles={["admin"]}>
                <Layout>
                  <ExecutionsPage />
                </Layout>
              </RoleRoute>
            }
          />

          <Route
            path="/events"
            element={
              <RoleRoute roles={["admin"]}>
                <Layout>
                  <EventsPage />
                </Layout>
              </RoleRoute>
            }
          />

          <Route
            path="/users"
            element={
              <RoleRoute roles={["admin"]}>
                <Layout>
                  <UsersPage />
                </Layout>
              </RoleRoute>
            }
          />

          <Route
            path="/demo"
            element={
              <RoleRoute roles={["admin"]}>
                <Layout>
                  <DemoPage />
                </Layout>
              </RoleRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
