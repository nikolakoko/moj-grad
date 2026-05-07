import { useState, useEffect } from 'react';

import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { useComplaints } from '@/context/ComplaintContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import React from "react";
import { useContext } from "react";
import { ComplaintContext } from "../../context/ComplaintContext";
import { ComplaintStatus, Priority } from "@/types";
import { apiClient } from '@/lib/apiClient';
import { toast } from "sonner";


// ── Reverse geocode ───────────────────────────────────────────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&accept-language=mk`;
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(nominatimUrl)}`);
    if (!res.ok) return `${lat}, ${lng}`;
    const data = await res.json();
    if (!data.display_name) return `${lat}, ${lng}`;
    const addr = data.address;
    const parts: string[] = [];
    if (addr.house_number) parts.push(addr.house_number);
    const street = addr.road ?? addr.pedestrian ?? addr.footway ?? addr.path ?? null;
    if (street) parts.push(street);
    const municipality = addr.municipality ?? null;
    if (municipality) parts.push(municipality);
    const city = addr.city ?? addr.town ?? addr.village ?? null;
    if (city) parts.push(city);
    return parts.length > 0 ? parts.join(', ') : data.display_name;
  } catch {
    return `${lat}, ${lng}`;
  }
}

// ── Лабели ────────────────────────────────────────────────────────────────────
const statusLabels: Record<string, string> = {
  PENDING: 'На чекање',
  IN_PROGRESS: 'Во тек',
  RESOLVED: 'Решена',
  REJECTED: 'Одбиена',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Низок',
  MEDIUM: 'Среден',
  HIGH: 'Висок',
};

// ── Бои (табела) ──────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-600 border-green-200',
  MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
  HIGH: 'bg-red-100 text-red-700 border-red-200',
};

// ── Sort orders ───────────────────────────────────────────────────────────────
const statusOrder: Record<string, number> = {
  PENDING: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  REJECTED: 3,
};

const priorityOrder: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

// ── Normalize ─────────────────────────────────────────────────────────────────
const normalizeEnum = (value: any, fallback: string): string => {
  if (!value) return fallback;
  if (typeof value === 'string') return value.toUpperCase().replace(/\s/g, '_');
  if (typeof value === 'object')
    return (value.name ?? value.value ?? fallback).toString().toUpperCase().replace(/\s/g, '_');
  return fallback;
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('mk-MK', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).replace(',', '');
};

export default function WorkerDashboard() {
  const { complaints = [], fetchComplaints } = useComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [addresses, setAddresses] = useState<Record<number, string>>({});
  const [editComplaint, setEditComplaint] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { updateComplaint } = useContext(ComplaintContext);

  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);
  const [transferComplaint, setTransferComplaint] = useState<any | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');

  useEffect(() => {
    apiClient('/departments/list').then((data) => setDepartments(data));
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ChevronsUpDown className="inline w-3.5 h-3.5 ml-1 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="inline w-3.5 h-3.5 ml-1 text-blue-500" />
      : <ChevronDown className="inline w-3.5 h-3.5 ml-1 text-blue-500" />;
  };


  useEffect(() => {
    (complaints as any[]).forEach((c) => {
      if (c.id === undefined || addresses[c.id]) return;

      if (c.latitude && c.longitude) {
        reverseGeocode(c.latitude, c.longitude).then((addr) =>
          setAddresses((prev) => ({ ...prev, [c.id]: addr }))
        );
      } else {
        setAddresses((prev) => ({ ...prev, [c.id]: 'Непозната локација' }));
      }
    });
  }, [complaints]);

  const itemsPerPage = 10;

  const uniqueDepartments = Array.from(
    new Set((complaints as any[]).map((c) => c.departmentName).filter(Boolean))
  ) as string[];

  const filteredComplaints = (complaints as any[])
    .filter((c) => {
      const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || normalizeEnum(c.complaintStatus, 'PENDING') === statusFilter;
      const matchesPriority = priorityFilter === 'all' || normalizeEnum(c.priority, 'LOW') === priorityFilter;
      const matchesDepartment = departmentFilter === 'all' || c.departmentName === departmentFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    })
    .sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'complaintStatus': {
          // normalizeEnum handles null/object values safely before lookup
          const aKey = normalizeEnum(a.complaintStatus, 'PENDING');
          const bKey = normalizeEnum(b.complaintStatus, 'PENDING');
          aVal = statusOrder[aKey] ?? 0;
          bVal = statusOrder[bKey] ?? 0;
          break;
        }
        case 'priority': {
          const aKey = normalizeEnum(a.priority, 'LOW');
          const bKey = normalizeEnum(b.priority, 'LOW');
          aVal = priorityOrder[aKey] ?? 0;
          bVal = priorityOrder[bKey] ?? 0;
          break;
        }
        case 'createdAt': {
          aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        }
        case 'departmentName': {
          aVal = (a.departmentName ?? '').toLowerCase();
          bVal = (b.departmentName ?? '').toLowerCase();
          break;
        }
        case 'title': {
          aVal = (a.title ?? '').toLowerCase();
          bVal = (b.title ?? '').toLowerCase();
          break;
        }
        default: {
          aVal = (a[sortBy] ?? '').toString().toLowerCase();
          bVal = (b[sortBy] ?? '').toString().toLowerCase();
          break;
        }
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const countByStatus = (status: string) =>
    (complaints as any[]).filter((c) => normalizeEnum(c.complaintStatus, 'PENDING') === status).length;



  return (
    <>
      <style>{`* { border-radius: 12px !important; }`}</style>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />

        <div className="flex-1 overflow-auto p-8">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Жалби</h1>
            <p className="text-gray-600">Преглед и управување</p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { emoji: '📊', label: 'Вкупно', value: complaints.length },
              { emoji: '⏳', label: 'На чекање', value: countByStatus('PENDING') },
              { emoji: '⚙️', label: 'Во тек', value: countByStatus('IN_PROGRESS') },
              { emoji: '✅', label: 'Решени', value: countByStatus('RESOLVED') },
            ].map(({ emoji, label, value }) => (
              <Card key={label} className="rounded-2xl bg-gray-50 border shadow-sm">
                <CardContent className="pt-6 flex items-center gap-3">
                  <span>{emoji}</span>
                  <div>
                    <p className="text-gray-500 text-sm">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FILTERS */}
          <Card className="mb-6 rounded-2xl">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="🔍 Пребарај по наслов..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="rounded-xl bg-gray-50 border-gray-200"
                />
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="rounded-xl bg-gray-100"><SelectValue placeholder="Статус" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Сите</SelectItem>
                    <SelectItem value="PENDING">На чекање</SelectItem>
                    <SelectItem value="IN_PROGRESS">Во тек</SelectItem>
                    <SelectItem value="RESOLVED">Решени</SelectItem>
                    <SelectItem value="REJECTED">Одбиени</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="rounded-xl bg-gray-100"><SelectValue placeholder="Приоритет" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Сите</SelectItem>
                    <SelectItem value="LOW">Низок</SelectItem>
                    <SelectItem value="MEDIUM">Среден</SelectItem>
                    <SelectItem value="HIGH">Висок</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={(v) => { setDepartmentFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="rounded-xl bg-gray-100"><SelectValue placeholder="Оддел" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Сите оддели</SelectItem>
                    {uniqueDepartments.map((dep) => (
                      <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* TABLE */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Листа на жалби ({filteredComplaints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Нема жалби</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left border-b text-gray-500">
                    <tr>
                      <th className="py-2 px-4">ID</th>
                      <th
                        className="px-4 cursor-pointer select-none hover:text-gray-800 transition"
                        onClick={() => handleSort('title')}
                      >
                        Наслов <SortIcon column="title" />
                      </th>
                      <th
                        className="px-4 cursor-pointer select-none hover:text-gray-800 transition"
                        onClick={() => handleSort('complaintStatus')}
                      >
                        Статус <SortIcon column="complaintStatus" />
                      </th>
                      <th
                        className="px-4 cursor-pointer select-none hover:text-gray-800 transition"
                        onClick={() => handleSort('priority')}
                      >
                        Приоритет <SortIcon column="priority" />
                      </th>
                      <th className="px-4">
                        Оддел
                      </th>
                      <th
                        className="px-4 cursor-pointer select-none hover:text-gray-800 transition"
                        onClick={() => handleSort('createdAt')}
                      >
                        Датум <SortIcon column="createdAt" />
                      </th>
                      <th className="px-4">Акции</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedComplaints.map((c: any, index: number) => {
                      const statusKey = normalizeEnum(c.complaintStatus, 'PENDING');
                      const priorityKey = normalizeEnum(c.priority, 'LOW');
                      return (
                        <React.Fragment key={c.id}>
                          <tr className="border-b hover:bg-gray-50 cursor-pointer transition">
                            <td className="px-4 py-4 font-bold text-gray-400">#{startIndex + index + 1}</td>
                            <td className="px-4 py-4">
                              <div className="font-medium">{c.title}</div>
                              <div className="text-xs text-gray-500">📍 {addresses[c.id] ?? 'Вчитување...'}</div>
                            </td>
                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                              <Select
                                  value={statusKey}
                                  onValueChange={async (newStatus) => {
                                    try {
                                      await apiClient(`/administration-worker/${c.id}/status?status=${newStatus}`, {
                                        method: 'PATCH',
                                      });
                                      toast.success('Статусот е успешно променет!');
                                      await fetchComplaints();
                                    }catch (err:any){
                                      toast.error(err?.message || 'Грешка при промена на статус');
                                    }
                                  }}
                              >
                                <SelectTrigger className={`w-36 text-xs font-medium border ${statusColors[statusKey] ?? ''}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">На чекање</SelectItem>
                                  <SelectItem value="IN_PROGRESS">Во тек</SelectItem>
                                  <SelectItem value="RESOLVED">Решена</SelectItem>
                                  <SelectItem value="REJECTED">Одбиена</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                              <Select
                                  value={priorityKey}
                                  onValueChange={async (newPriority) => {
                                    try {
                                      await apiClient(`/administration-worker/${c.id}/priority?priority=${newPriority}`, {
                                        method: 'PATCH',
                                      });
                                      toast.success('Приоритетот е успешно променет!');
                                      await fetchComplaints();
                                    }catch (err: any){
                                      toast.error(err?.message || 'Грешка при промена на приоритет');
                                    }
                                  }}
                              >
                                <SelectTrigger className={`w-32 text-xs font-medium border ${priorityColors[priorityKey] ?? ''}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="LOW">Низок</SelectItem>
                                  <SelectItem value="MEDIUM">Среден</SelectItem>
                                  <SelectItem value="HIGH">Висок</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs border">
                                  {c.departmentName ?? '-'}
                                </span>
                                <button
                                    onClick={() => { setTransferComplaint(c); setSelectedDepartmentId(''); }}
                                    className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                                >
                                  Префрли
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-500">
                              {new Date(c.createdAt).toLocaleDateString('mk-MK')}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedComplaint(c); setEditComplaint(c); }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                              >
                                Детали
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* PAGINATION */}
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Претходна
            </button>
            <span className="text-sm">Страна {currentPage} / {totalPages || 1}</span>
            <button
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Следна
            </button>
          </div>

        </div>


        {/* ── TRANSFER MODAL ── */}
        <Dialog
            open={!!transferComplaint}
            onOpenChange={(open) => {
              if (!open) {
                setTransferComplaint(null);
                setSelectedDepartmentId('');
              }
            }}
        >
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Префрли во оддел</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-sm text-gray-600">
                Жалба: <span className="font-medium">{transferComplaint?.title}</span>
              </p>

              <div className="space-y-2">
                <Label>Избери оддел</Label>
                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger className="rounded-xl bg-gray-100">
                    <SelectValue placeholder="Одбери оддел..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep) => (
                        <SelectItem key={dep.id} value={String(dep.id)}>
                          {dep.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                    onClick={() => { setTransferComplaint(null); setSelectedDepartmentId(''); }}
                    className="flex-1 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 transition"
                >
                  Откажи
                </button>
                <button
                    disabled={!selectedDepartmentId}
                    onClick={async () => {
                      try {
                        await apiClient(`/administration-worker/${transferComplaint.id}/department/${selectedDepartmentId}`, {
                          method: 'PATCH',
                        });
                        toast.success('Одделот е успешно променет!');
                        await fetchComplaints();
                        setTransferComplaint(null);
                        setSelectedDepartmentId('');
                      } catch (err: any) {
                        toast.error(err?.message || 'Грешка при префрлување');
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition"
                >
                  Потврди
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── DETAIL MODAL ── */}
        <Dialog
          open={!!selectedComplaint}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedComplaint(null);
              setEditComplaint(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">

            <DialogHeader>
              <DialogTitle>
                Детали за жалба #{selectedComplaint?.id}
              </DialogTitle>
            </DialogHeader>

            {selectedComplaint && (
              <div className="space-y-6">

                {/* НАСЛОВ */}
                <div>
                  <Label>Наслов</Label>
                  <p className="text-lg font-semibold mt-1">
                    {selectedComplaint.title}
                  </p>
                </div>

                {/* ОПИС */}
                <div>
                  <Label>Опис</Label>
                  <p className="text-gray-700 mt-1">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* СЛИКА */}
                {selectedComplaint.photo && (
                  <div>
                    <Label>Слика</Label>
                    <img
                      src={selectedComplaint.photo}
                      alt="Complaint"
                      className="mt-2 rounded-lg w-full max-h-64 object-cover"
                    />
                  </div>
                )}

                {/* ЛОКАЦИЈА */}
                <div>
                  <Label>Локација</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-2">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {addresses[selectedComplaint.id] ?? "Вчитување..."}
                    </p>
                    <p className="text-xs text-gray-500">
                      Координати: {selectedComplaint.latitude}, {selectedComplaint.longitude}
                    </p>
                  </div>
                </div>

                {/* ── 3 КОПЧИЊА ── */}
                <div className="flex gap-3 flex-wrap">

                  {/* СТАТУС */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-gray-50">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Статус</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      statusColors[normalizeEnum(selectedComplaint?.complaintStatus, 'PENDING')] ?? ''
                    }`}>
                      {statusLabels[normalizeEnum(selectedComplaint?.complaintStatus, 'PENDING')] ?? '-'}
                    </span>
                  </div>

                  {/* ПРИОРИТЕТ */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-gray-50">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Приоритет</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      priorityColors[normalizeEnum(selectedComplaint?.priority, 'LOW')] ?? ''
                    }`}>
                      {priorityLabels[normalizeEnum(selectedComplaint?.priority, 'LOW')] ?? '-'}
                    </span>
                  </div>

                  {/* ОДДЕЛ */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-gray-50">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Оддел</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200">
                      {selectedComplaint?.departmentName ?? '-'}
                    </span>
                  </div>

                </div>


                {/* ДАТУМ */}
                <div className="pt-2 border-t border-gray-100">
                  <Label>Креирано</Label>
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDateTime(selectedComplaint.createdAt)}
                  </p>
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}