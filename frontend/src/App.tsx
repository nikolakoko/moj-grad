import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toast } from "@/components/ui/toast";
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

function App() {
  return (
    <AuthProvider>
      <Toast />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/upload" element={<DocumentUploadPage />} />
          <Route path="/dashboard/generate" element={<DocumentGeneratePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add-worker" element={<AddWorkerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;