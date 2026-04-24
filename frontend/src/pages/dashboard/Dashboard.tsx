import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Работнички панел
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Најавен како: {user?.email}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Одјави се
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600">
            Добредојдовте во работничкиот панел.
          </p>
        </div>

      </div>
    </div>
  );
}