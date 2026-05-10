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

interface Department {
  id: number;
  name: string;
}

// ─── Custom Confirm Modal ───────────────────────────────────────────────────
interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
          <p className="text-sm text-gray-700 mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Откажи
            </button>
            <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              Потврди
            </button>
          </div>
        </div>
      </div>
  );
}

// ─── Toast Notification ────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: "success" | "error" | "loading";
}

function Toast({ message, type }: ToastProps) {
  return (
      <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 bg-white rounded-2xl shadow-xl px-5 py-3 border border-gray-100">
        {type === "loading" && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        {type === "success" && <span className="text-green-500 text-lg">✓</span>}
        {type === "error" && <span className="text-red-500 text-lg">✕</span>}
        <span className="text-sm font-medium text-gray-700">{message}</span>
      </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState<keyof Worker>("email");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEnabled, setFilterEnabled] = useState("all");

  // Department modal state
  const [departmentModalWorker, setDepartmentModalWorker] = useState<Worker | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<ToastProps | null>(null);

  const size = 10;
  const handleSort = (field: keyof Worker) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };
  const processedWorkers = workers
    .filter((w) => {
      const matchDepartment =
        filterDepartment === "all" || w.departmentName === filterDepartment;

      const matchStatus =
        filterStatus === "all" || w.status === filterStatus;

      const matchEnabled =
        filterEnabled === "all"
          ? true
          : filterEnabled === "true"
            ? w.enabled === true
            : w.enabled === false;

      return matchDepartment && matchStatus && matchEnabled;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // handle undefined safely
      aVal = aVal ?? "";
      bVal = bVal ?? "";

      // string compare
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const SortIndicator = ({ column }: { column: keyof Worker }) => {
    if (sortBy !== column) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }

    return sortDir === "asc" ? (
      <span className="text-blue-500 ml-1">↑</span>
    ) : (
      <span className="text-blue-500 ml-1">↓</span>
    );
  };


  const showToast = (message: string, type: ToastProps["type"], duration = 2500) => {
    setToast({ message, type });
    if (type !== "loading") {
      setTimeout(() => setToast(null), duration);
    }
  };

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/admin/workers?page=${currentPage}&size=${size}&sortBy=email&direction=asc${search ? `&search=${encodeURIComponent(search)}` : ""
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

  const fetchDepartments = async () => {
    try {
      const res = await apiClient("/departments/list");
      setDepartments(res ?? []);
    } catch (error) {
      console.error(error);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [currentPage, search]);

  // ── Toggle archive/unarchive ──────────────────────────────────────────────
  const toggleWorker = (worker: Worker) => {
    setConfirmModal({
      message: worker.enabled
          ? `Дали сте сигурни дека сакате да го архивирате работникот ${worker.name ?? worker.email}?`
          : `Дали сте сигурни дека сакате да го активирате работникот ${worker.name ?? worker.email}?`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          if (worker.enabled) {
            await apiClient(`/admin/workers/${worker.id}/archive`, { method: "PATCH" });
          } else {
            await apiClient(`/admin/workers/${worker.id}/unarchive`, { method: "PATCH" });
          }
          await fetchWorkers();
        } catch (error) {
          console.error(error);
          setError("Грешка при промена на статус");
        }
      },
    });
  };

  // ── Department modal ──────────────────────────────────────────────────────
  const openDepartmentModal = async (worker: Worker) => {
    setDepartmentModalWorker(worker);
    setSelectedDepartmentId("");
    setDepartmentError(null);
    await fetchDepartments();
  };

  const closeDepartmentModal = () => {
    setDepartmentModalWorker(null);
    setSelectedDepartmentId("");
    setDepartmentError(null);
  };

  const handleAssignDepartment = async () => {
    if (!departmentModalWorker || !selectedDepartmentId) return;

    try {
      setDepartmentLoading(true);
      setDepartmentError(null);
      await apiClient(
        `/admin/workers/${departmentModalWorker.id}/department/${selectedDepartmentId}`,
        { method: "PATCH" }
      );
      closeDepartmentModal();
      await fetchWorkers();
    } catch (error) {
      console.error(error);
      setDepartmentError("Грешка при доделување на оддел");
    } finally {
      setDepartmentLoading(false);
    }
  };

  const handleRemoveDepartment = () => {
    if (!departmentModalWorker) return;
    setConfirmModal({
      message: `Дали сте сигурни дека сакате да го отстраните одделот од ${
          departmentModalWorker.name ?? departmentModalWorker.email
      }?`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setDepartmentLoading(true);
          setDepartmentError(null);
          await apiClient(`/admin/workers/${departmentModalWorker.id}/department`, {
            method: "DELETE",
          });
          closeDepartmentModal();
          await fetchWorkers();
        } catch (error) {
          console.error(error);
          setDepartmentError("Грешка при отстранување на оддел");
        } finally {
          setDepartmentLoading(false);
        }
      },
    });
  };

  // ── Request update ────────────────────────────────────────────────────────
  const handleRequestUpdate = (worker: Worker) => {
    setConfirmModal({
      message: `Дали сте сигурни дека сакате да му испратите барање за ажурирање на податоци на ${
          worker.name ?? worker.email
      }?`,
      onConfirm: async () => {
        setConfirmModal(null);
        showToast("Се испраќа барање...", "loading");
        try {
          await apiClient("/admin/workers/edit", {
            method: "POST",
            body: JSON.stringify({ email: worker.email }),
          });
          setToast({ message: "Барањето е успешно испратено!", type: "success" });
          setTimeout(() => setToast(null), 2500);
        } catch (error) {
          console.error(error);
          setToast({ message: "Грешка при испраќање на барањето", type: "error" });
          setTimeout(() => setToast(null), 2500);
        }
      },
    });
  };

  const goNext = () => { if (currentPage + 1 < totalPages) setCurrentPage((p) => p + 1); };
  const goPrev = () => { if (currentPage > 0) setCurrentPage((p) => p - 1); };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />

      <div className="flex-1 p-8 overflow-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Административни работници</h1>
          <p className="text-gray-500 mt-1">Управување со административни корисници</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 min-h-[130px] flex flex-col justify-center">
            <p className="text-base text-gray-500">👥 Вкупно работници</p>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">{workers.length}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 min-h-[130px] flex flex-col justify-center">
            <p className="text-base text-gray-500">✅ Активни</p>
            <h2 className="text-4xl font-bold text-green-600 mt-3">
              {workers.filter((w) => w.enabled).length}
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 min-h-[130px] flex flex-col justify-center">
            <p className="text-base text-gray-500">📩 Поканети</p>
            <h2 className="text-4xl font-bold text-yellow-500 mt-3">
              {workers.filter((w) => w.status === "INVITED").length}
            </h2>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Пребарај по ime или email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full max-w-md px-4 py-2 border rounded-xl bg-white"
          />
        </div>

          {loading && (
              <div className="bg-white rounded-xl shadow p-6 text-center">Вчитување...</div>
          )}
          {error && (
              <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6">{error}</div>
          )}

        <div className="flex gap-3 mb-4 flex-wrap">

          {/* Department */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="all">Сите оддели</option>
            {[...new Set(workers.map(w => w.departmentName))].map(dep => (
              <option key={dep} value={dep ?? ""}>{dep}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="all">Сите статуси</option>
            <option value="REGISTERED">Регистриран</option>
            <option value="INVITED">Поканет</option>
          </select>

          {/* Enabled */}
          <select
            value={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="all">Активни и неактивни</option>
            <option value="true">Активни</option>
            <option value="false">Неактивни</option>
          </select>

        </div>

        {/* TABLE */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">Листа на работници</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-gray-600">
                  <tr>
                    <th className="text-left px-6 py-4 cursor-pointer select-none" onClick={() => handleSort("name")}>Име  <SortIndicator column="name" /></th>
                    <th className="text-left px-6 py-4 cursor-pointer select-none" onClick={() => handleSort("email")}>Email <SortIndicator column="email" /></th>
                    <th className="text-left px-6 py-4 cursor-pointer select-none" onClick={() => handleSort("departmentName")}>Оддел <SortIndicator column="departmentName" /></th>
                    <th className="text-left px-6 py-4 cursor-pointer select-none" onClick={() => handleSort("status")}>Статус <SortIndicator column="status" /></th>
                    <th className="text-left px-6 py-4 cursor-pointer select-none" onClick={() => handleSort("enabled")}>Активен</th>
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
                    processedWorkers.map((worker) => (
                      <tr key={worker.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {worker.name ?? "/"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">{worker.email}</td>

                        {/* DEPARTMENT CELL - clickable */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openDepartmentModal(worker)}
                            className="text-left group"
                          >
                            {worker.departmentName ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition">
                                {worker.departmentName}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 group-hover:bg-gray-200 transition">
                                + Додели оддел
                              </span>
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              worker.status === "REGISTERED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {worker.status === "REGISTERED" ? "Регистриран" : "Поканет"}
                          </span>
                              </td>
                              <td className="px-6 py-4">
                          <span className={`font-medium ${worker.enabled ? "text-green-600" : "text-red-500"}`}>
                            {worker.enabled ? "Да" : "Не"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {worker.status === "INVITED" ? (
                            <span className="text-sm text-gray-400">Нема акции</span>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleRequestUpdate(worker)}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition bg-blue-50 text-blue-600 hover:bg-blue-100"
                              >
                                Барај ажурирање
                              </button>

                              <button
                                onClick={() => toggleWorker(worker)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${worker.enabled
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                                  }`}
                              >
                                {worker.enabled ? "Архивирај" : "Активирај"}
                              </button>
                            </div>
                          )}
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

      {/* DEPARTMENT MODAL */}
      {departmentModalWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Управување со оддел
              </h3>
              <button
                onClick={closeDepartmentModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Работник:{" "}
              <span className="font-medium text-gray-800">
                {departmentModalWorker.name ?? departmentModalWorker.email}
              </span>
            </p>

                {/* КОРЕКЦИЈА 3: Ако има оддел → само Отстрани. Ако нема → само dropdown */}
                {departmentModalWorker.departmentName ? (
                    <div className="bg-blue-50 rounded-xl px-4 py-4 mb-4">
                      <p className="text-sm text-blue-700 mb-3">
                        Тековен оддел:{" "}
                        <span className="font-semibold">{departmentModalWorker.departmentName}</span>
                      </p>
                      <button
                          onClick={handleRemoveDepartment}
                          disabled={departmentLoading}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        Отстрани оддел
                      </button>
                    </div>
                ) : (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Додели оддел
                      </label>
                      <select
                          value={selectedDepartmentId}
                          onChange={(e) => setSelectedDepartmentId(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">— Избери оддел —</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                        ))}
                      </select>
                    </div>
                )}

            {departmentError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2 mb-4">
                {departmentError}
              </div>
            )}

                <div className="flex gap-3 justify-end">
                  <button
                      onClick={closeDepartmentModal}
                      className="px-4 py-2 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    Откажи
                  </button>
                  {!departmentModalWorker.departmentName && (
                      <button
                          onClick={handleAssignDepartment}
                          disabled={!selectedDepartmentId || departmentLoading}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40"
                      >
                        {departmentLoading ? "Се зачувува..." : "Зачувај"}
                      </button>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* ── CUSTOM CONFIRM MODAL ── */}
        {confirmModal && (
            <ConfirmModal
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(null)}
            />
        )}

        {/* ── TOAST ── */}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
  );
}
