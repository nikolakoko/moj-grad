import { useState, useEffect } from 'react';

import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { useComplaints } from '@/context/ComplaintContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';
import React from "react";
import { useContext } from "react";
import { ComplaintContext } from "../../context/ComplaintContext";


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
  const { complaints = [] } = useComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [addresses, setAddresses] = useState<Record<number, string>>({});
  const [editComplaint, setEditComplaint] = useState<any | null>(null);
  const { updateComplaint } = useContext(ComplaintContext);


  useEffect(() => {
    (complaints as any[]).forEach((c) => {
      if (c.id !== undefined && !addresses[c.id] && c.latitude && c.longitude) {
        reverseGeocode(c.latitude, c.longitude).then((addr) =>
          setAddresses((prev) => ({ ...prev, [c.id]: addr }))
        );
      }
    });
  }, [complaints]);

  const itemsPerPage = 10;

  const uniqueDepartments = Array.from(
    new Set((complaints as any[]).map((c) => c.departmentName).filter(Boolean))
  ) as string[];

  const filteredComplaints = (complaints as any[]).filter((c) => {
    const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || normalizeEnum(c.complaintStatus, 'PENDING') === statusFilter;
    const matchesPriority = priorityFilter === 'all' || normalizeEnum(c.priority, 'LOW') === priorityFilter;
    const matchesDepartment = departmentFilter === 'all' || c.departmentName === departmentFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
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
                      <th className="px-4">Наслов</th>
                      <th className="px-4">Статус</th>
                      <th className="px-4">Приоритет</th>
                      <th className="px-4">Оддел</th>
                      <th className="px-4">Датум</th>
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
                            <td className="px-4 py-4">
                              <Badge className={statusColors[statusKey] ?? ''}>{statusLabels[statusKey] ?? statusKey}</Badge>
                            </td>
                            <td className="px-4 py-4">
                              <Badge className={priorityColors[priorityKey] ?? ''}>{priorityLabels[priorityKey] ?? priorityKey}</Badge>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs border">
                                {c.departmentName ?? '-'}
                              </span>
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
