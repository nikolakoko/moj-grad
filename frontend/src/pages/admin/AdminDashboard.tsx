import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";

interface Worker {
  id: string;
  name?: string;
  email: string;
  status: "REGISTERED" | "INVITED";
  enabled: boolean;
  departmentName?: string;
}

export default function AdminDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const size = 10;

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/admin/workers?page=${currentPage}&size=${size}&sortBy=email&direction=asc${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`;

      const res = await apiClient(url);

      setWorkers(res?.content ?? []);
      setTotalPages(res?.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      setError("Грешка при вчитување на работници");
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [currentPage, search]);

  const toggleWorker = async (worker: Worker) => {
    const confirmMessage = worker.enabled
      ? "Дали сте сигурни дека сакате да го архивирате работникот?"
      : "Дали сте сигурни дека сакате да го активирате работникот?";

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) return;

    try {
      if (worker.enabled) {
        await apiClient(`/admin/workers/${worker.id}/archive`, {
          method: "PATCH",
        });
      } else {
        await apiClient(`/admin/workers/${worker.id}/unarchive`, {
          method: "PATCH",
        });
      }

      await fetchWorkers();
    } catch (error) {
      console.error(error);
      setError("Грешка при промена на статус");
    }
  };


  const goNext = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />

      <div className="flex-1 p-8 overflow-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Административни работници
          </h1>
          <p className="text-gray-500 mt-1">
            Управување со административни корисници
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow-md p-6 min-h-[130px] flex flex-col justify-center">
            <p className="text-base text-gray-500">
              👥 Вкупно работници
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">
              {workers.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 min-h-[130px] flex flex-col justify-center">
            <p className="text-base text-gray-500">
              ✅ Активни
            </p>
            <h2 className="text-4xl font-bold text-green-600 mt-3">
              {workers.filter((w) => w.enabled).length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 min-h-[130px] flex flex-col justify-center">
            <p className="text-base text-gray-500">
              📩 Поканети
            </p>
            <h2 className="text-4xl font-bold text-yellow-500 mt-3">
              {workers.filter((w) => w.status === "INVITED").length}
            </h2>
          </div>

        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пребарај по име или email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full max-w-md px-4 py-2 border rounded-xl bg-white"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            Вчитување...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6">
            {error}
            <p className="text-xs mt-1 text-red-400">
              Забелешка: Бекендот мора да дозволи ADMIN пристап до /api/administration-worker
              (hasAnyRole во WebSecurityConfig.java).
            </p>
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">
                Листа на работници
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-gray-600">
                  <tr>
                    <th className="text-left px-6 py-4">Име</th>
                    <th className="text-left px-6 py-4">Email</th>
                    <th className="text-left px-6 py-4">Оддел</th>
                    <th className="text-left px-6 py-4">Статус</th>
                    <th className="text-left px-6 py-4">Активен</th>
                    <th className="text-center px-6 py-4">Акции</th>
                  </tr>
                </thead>

                <tbody>
                  {workers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-500">
                        Нема работници
                      </td>
                    </tr>
                  ) : (
                    workers.map((worker) => (
                      <tr key={worker.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {worker.name ?? "Нема име"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {worker.email}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {worker.departmentName ?? "Не е доделен"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${worker.status === "REGISTERED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {worker.status === "REGISTERED"
                              ? "Регистриран"
                              : "Поканет"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`font-medium ${worker.enabled ? "text-green-600" : "text-red-500"
                              }`}
                          >
                            {worker.enabled ? "Да" : "Не"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleWorker(worker)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${worker.enabled
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                          >
                            {worker.enabled ? "Архивирај" : "Активирај"}
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

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-xl border bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
            disabled={currentPage === 0}
            onClick={goPrev}
          >
            Претходна
          </button>

          <span className="text-sm">
            Страна {currentPage + 1} / {totalPages}
          </span>

          <button
            className="px-4 py-2 rounded-xl border bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
            disabled={currentPage + 1 >= totalPages}
            onClick={goNext}
          >
            Следна
          </button>
        </div>
      </div>
    </div>
  );
}