import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ComplaintProvider } from "@/context/ComplaintContext";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import DocumentUploadPage from "./pages/dashboard/DocumentUploadPage.tsx";
import DocumentGeneratePage from "./pages/dashboard/DocumentGeneratePage.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AddWorkerPage from "./pages/admin/AddWorkerPage.tsx";
import RegisterPage from "./pages/admin/RegisterPage.tsx";
import DepartmentsPage from "./pages/admin/DepartmentsPage.tsx";
import EditWorkerPage from "./pages/admin/EditWorkerPage.tsx";

function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ComplaintProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/worker/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/upload" element={<DocumentUploadPage />} />
            <Route path="/dashboard/generate" element={<DocumentGeneratePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-worker" element={<AddWorkerPage />} />
            <Route path="/admin/departments" element={<DepartmentsPage />} />
            <Route path="/workers/edit" element={<EditWorkerPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ComplaintProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;