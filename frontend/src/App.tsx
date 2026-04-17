import { BrowserRouter, Routes, Route } from "react-router-dom";
import Toaster from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/dashboard/Dashboard";
import DocumentUploadPage from "./pages/dashboard/DocumentUploadPage";
import DocumentGeneratePage from "./pages/dashboard/DocumentGeneratePage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AddWorkerPage from "./pages/admin/AddWorkerPage";

import ProtectedRoute from "@/routes/ProtectedRoutes";
import AdminRoute from "@/routes/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* USER PROTECTED */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/upload"
            element={
              <ProtectedRoute>
                <DocumentUploadPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/generate"
            element={
              <ProtectedRoute>
                <DocumentGeneratePage />
              </ProtectedRoute>
            }
          />

          {/* ADMIN PROTECTED */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/add-worker"
            element={
              <AdminRoute>
                <AddWorkerPage />
              </AdminRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;