import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Download,
  Users,
  UserPlus,
  LogOut,
  Building2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  
  const isAdmin = user?.role === "ADMIN";
  const isWorker = user?.role === "ADMINISTRATION_WORKER";

  const isActive = (path: string) => location.pathname === path;

  const displayName = user?.name || user?.email || "Корисник";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">

      {/* LOGO */}
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold">МојГрад</span>
        </Link>
      </div>

      {/* USER INFO */}
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold">
            {initial}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {displayName}
          </p>

          <p className="text-xs text-gray-500">
            {isAdmin
              ? "Администратор"
              : isWorker
              ? "Административен работник"
              : "Корисник"}
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-4 space-y-1">

        {/* WORKER */}
        {isWorker && (
          <>
            <Link to="/dashboard">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                isActive("/dashboard")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
                <FileText className="w-5 h-5" />
                <span>Жалби</span>
              </div>
            </Link>

            <Link to="/dashboard/upload">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                isActive("/dashboard/upload")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
                <Upload className="w-5 h-5" />
                <span>Прикачи документ</span>
              </div>
            </Link>

            <Link to="/dashboard/generate">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                isActive("/dashboard/generate")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
                <Download className="w-5 h-5" />
                <span>Генерирај документ</span>
              </div>
            </Link>
          </>
        )}

        {/* ADMIN */}
        {isAdmin && (
          <>
            <Link to="/admin">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                isActive("/admin")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
                <Users className="w-5 h-5" />
                <span>Работници</span>
              </div>
            </Link>

            <Link to="/admin/add-worker">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                isActive("/admin/add-worker")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
                <UserPlus className="w-5 h-5" />
                <span>Додај работник</span>
              </div>
            </Link>
          </>
        )}

      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Одјави се</span>
        </Button>
      </div>
    </div>
  );
}