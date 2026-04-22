import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ComplaintProvider>
          <Toaster />
          <Sonner />
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
        </ComplaintProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;