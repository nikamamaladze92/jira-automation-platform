import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RulesPage from "./pages/RulesPage";
import TicketsPage from "./pages/TicketsPage";

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Layout>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route
//               path="/"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/rules"
//               element={
//                 <ProtectedRoute>
//                   <RulesPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/tickets"
//               element={
//                 <ProtectedRoute>
//                   <TicketsPage />
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
//         </Layout>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
