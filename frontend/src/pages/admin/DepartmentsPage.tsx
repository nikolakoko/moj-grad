import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Building2, Plus, Trash2, X } from "lucide-react";

interface Department {
  id: number;
  name: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient("/departments/list");
      setDepartments(res ?? []);
    } catch (err) {
      console.error(err);
      setError("Грешка при вчитување на одделенија");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setCreateError("Името е задолжително");
      return;
    }
    if (newName.trim().length < 2 || newName.trim().length > 40) {
      setCreateError("Името мора да биде помеѓу 2 и 40 карактери");
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);
      const created = await apiClient("/admin/departments/add", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      setDepartments((prev) => [...prev, created]);
      setNewName("");
      setShowModal(false);
    } catch (err: any) {
      setCreateError(err?.message || "Грешка при креирање");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (department: Department) => {
    const confirmed = window.confirm(
      `Дали сте сигурни дека сакате да го избришете одделот „${department.name}"?`
    );
    if (!confirmed) return;

    try {
      await apiClient(`/admin/departments/${department.id}/remove`, {
        method: "DELETE",
      });
      setDepartments((prev) => prev.filter((d) => d.id !== department.id));
    } catch (err) {
      console.error(err);
      alert("Грешка при бришење на оддел");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewName("");
    setCreateError(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />

      <div className="flex-1 p-8 overflow-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Одделенија</h1>
          <p className="text-gray-500 mt-1">
            Управување со одделенија во системот
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 min-h-[130px] flex flex-col justify-center">
            <p className="text-base text-gray-500">🏢 Вкупно одделенија</p>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">
              {departments.length}
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 min-h-[130px] flex flex-col justify-center">
            <p className="text-base text-gray-500">✅ Активни</p>
            <h2 className="text-4xl font-bold text-green-600 mt-3">
              {departments.length}
            </h2>
          </div>
        </div>

        {/* TABLE HEADER ROW */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Листа на одделенија
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Креирај оддел
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            Вчитување...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-gray-600">
                  <tr>
                    <th className="text-left px-6 py-4">#</th>
                    <th className="text-left px-6 py-4">Назив на оддел</th>
                    <th className="text-center px-6 py-4">Акции</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-16 text-gray-400"
                      >
                        <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        Нема креирани одделенија
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept, index) => (
                      <tr
                        key={dept.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            {dept.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(dept)}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Избриши
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Креирај нов оддел
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Назив на оддел
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setCreateError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") closeModal();
                  }}
                  placeholder="пр. Комунални услуги"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {createError && (
                  <p className="text-red-500 text-sm mt-1">{createError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Откажи
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {creating ? (
                    "Се зачувува..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Зачувај
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}