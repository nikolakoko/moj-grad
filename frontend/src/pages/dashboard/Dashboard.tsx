import { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { useComplaints } from '@/context/ComplaintContext';
import { useAuth } from '@/context/AuthContext';
import { ComplaintStatus, Priority, Department, Complaint } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Calendar, Eye, FileText, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import React from "react";

const statusColors: Record<ComplaintStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};
const priorityColors: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-800 border-gray-200',
  MEDIUM: 'bg-orange-100 text-orange-800 border-orange-200',
  HIGH: 'bg-red-100 text-red-800 border-red-200',
};


export default function WorkerDashboard() {
  const { complaints = [] } = useComplaints();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showMyDepartment, setShowMyDepartment] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const itemsPerPage = 10;

  // ---------------- LABELS ----------------
  const statusLabels: any = {
    PENDING: " На чекање",
    IN_PROGRESS: " Во тек",
    RESOLVED: "Решена",
    REJECTED: " Одбиена",
  };

  const priorityLabels: any = {
    LOW: " Низок",
    MEDIUM: "Среден",
    HIGH: " Висок",
  };

  const departmentLabels: any = { INFRASTRUCTURE: "Инфраструктура",
     ENVIRONMENT: "Животна средина",
     PUBLIC_SAFETY: "Јавна безбедност",
     UTILITIES: "Комунални услуги",
     OTHER: "Друго", };
   
   // ---------------- COLORS ----------------
  const statusColors: any = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const priorityColors: any = {
    LOW: "bg-green-100 text-green-500",
    MEDIUM: "bg-orange-100 text-orange-700",
    HIGH: "bg-red-100 text-red-700",
  };
  

  // ---------------- NORMALIZE ----------------
  const normalizeEnum = (value: any, fallback: string) => {
    if (!value) return fallback;

    if (typeof value === "string") {
      return value.toUpperCase().replace(/\s/g, "_");
    }

    if (typeof value === "object") {
      return (value.name ?? value.value ?? fallback)
        .toString()
        .toUpperCase()
        .replace(/\s/g, "_");
    }

    return fallback;
  };

  // ---------------- FILTER ----------------
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      normalizeEnum(c.status, "PENDING") === statusFilter;

    const matchesPriority =
      priorityFilter === 'all' ||
      normalizeEnum(c.priority, "LOW") === priorityFilter;

       const matchesDepartment =
       departmentFilter === "all" ||
       c.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedComplaints = filteredComplaints.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const countByStatus = (status: string) =>
    complaints.filter(
      (c) => normalizeEnum(c.status, "PENDING") === status
    ).length;

  const countByPriority = (priority: string) =>
    complaints.filter(
      (c) => normalizeEnum(c.priority, "LOW") === priority
    ).length;

  return (
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

          <Card className="rounded-2xl bg-gray-50 border shadow-sm">
            <CardContent className="pt-6 flex items-center gap-3">
              <span>📊</span>
              <div>
                <p className="text-gray-500 text-sm">Вкупно</p>
                <p className="text-xl font-bold">{complaints.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-gray-50 border shadow-sm">
            <CardContent className="pt-6 flex items-center gap-3">
              <span>⏳</span>
              <div>
                <p className="text-gray-500 text-sm">На чекање</p>
                <p className="text-xl font-bold">
                  {countByStatus("PENDING")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-gray-50 border shadow-sm">
            <CardContent className="pt-6 flex items-center gap-3">
              <span>⚙️</span>
              <div>
                <p className="text-gray-500 text-sm">Во тек</p>
                <p className="text-xl font-bold">
                  {countByStatus("IN_PROGRESS")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-gray-50 border shadow-sm">
            <CardContent className="pt-6 flex items-center gap-3">
              <span>✅</span>
              <div>
                <p className="text-gray-500 text-sm">Решени</p>
                <p className="text-xl font-bold">
                  {countByStatus("RESOLVED")}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* FILTERS */}
        <Card className="mb-6 rounded-2xl">
          <CardContent className="pt-6">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <Input
                placeholder="🔍 Пребарај по наслов..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-xl bg-gray-50 border-gray-200"
              />

               {/* STATUS */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl bg-gray-100">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите</SelectItem>
                  <SelectItem value="PENDING">На чекање</SelectItem>
                  <SelectItem value="IN_PROGRESS">Во тек</SelectItem>
                  <SelectItem value="RESOLVED">Решени</SelectItem>
                  <SelectItem value="REJECTED">Одбиени</SelectItem>
                </SelectContent>
              </Select>

              {/* PRIORITY */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="rounded-xl bg-gray-100">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите</SelectItem>
                  <SelectItem value="LOW">Низок</SelectItem>
                  <SelectItem value="MEDIUM">Среден</SelectItem>
                  <SelectItem value="HIGH">Висок</SelectItem>
                </SelectContent>
              </Select>

              {/* DEPARTMENT FILTER (NEW) */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
             <SelectTrigger className="rounded-xl bg-gray-100">
             <SelectValue placeholder="Оддел" />
             </SelectTrigger>

             <SelectContent>
             <SelectItem value="all">Сите оддели</SelectItem>
             <SelectItem value="Инфраструктура">Инфраструктура</SelectItem>
             <SelectItem value="Животна средина">Животна средина</SelectItem>
             <SelectItem value="Јавна безбедност">Јавна безбедност</SelectItem>
             <SelectItem value="Комунални услуги">Комунални услуги</SelectItem>
             <SelectItem value="Друго">Друго</SelectItem>
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
              <div className="text-center py-10 text-gray-500">
                Нема жалби
              </div>
            ) : (
              <table className="w-full text-sm">

                <thead className="text-left border-b text-gray-500">
                  <tr>
                    <th className="py-2">ID</th>
                    <th>Наслов</th>
                    <th>Статус</th>
                    <th>Приоритет</th>
                    <th>Оддел</th>
                    <th>Датум</th>
                    <th>Акции</th>
                  </tr>
                </thead>

                 <tbody>
                  {selectedComplaint && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white w-[520px] rounded-xl p-6 shadow-lg">

      <h2 className="text-xl font-bold mb-4">
        Детали за жалба
      </h2>

      {/* IMAGE */}
      {selectedComplaint.image && (
        <img
          src={selectedComplaint.image}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      <div className="space-y-2 text-sm">

        <p><b>Наслов:</b> {selectedComplaint.title}</p>
        <p><b>Опис:</b> {selectedComplaint.description}</p>
        <p><b>Слика:</b></p>
        <img src={selectedComplaint.image} alt="complaint" className="w-full h-48 object-cover rounded mt-2"/>
        <p><b>Статус:</b>{" "}
          {typeof selectedComplaint.status === "object"
          ? selectedComplaint.status?.name || selectedComplaint.status?.value
          : selectedComplaint.status}</p>
        <p><b>Приоритет:</b> {selectedComplaint.priority}</p>
        <p><b>Оддел:</b> {selectedComplaint.department}</p>
        <p>
          <b>Локација:</b> {selectedComplaint.latitude}, {selectedComplaint.longitude}
        </p>

      </div>
      

      <button
        className="mt-5 px-4 py-2 bg-red-500 text-white rounded"
        onClick={() => setSelectedComplaint(null)}
      >
        Затвори
      </button>

    </div>

  </div>
)}
  {filteredComplaints.map((c, index) => {
    const statusKey = normalizeEnum(c.status, "PENDING");
    const priorityKey = normalizeEnum(c.priority, "LOW");
    const departmentKey = normalizeEnum(c.department, "OTHER");

    const isOpen = openRow === c.id;

    return (
      <React.Fragment key={c.id}>

        {/* MAIN ROW */}
        <tr
          onClick={() => setOpenRow(isOpen ? null : c.id)}
          className="
            border-b
            hover:bg-gray-50
            cursor-pointer
            transition
          "
        >

          {/* ID */}
          <td className="px-4 py-4 font-bold text-gray-400">
            #{index + 1}
          </td>

          {/* TITLE + LOCATION */}
          <td className="px-4 py-4">
            <div className="font-medium">{c.title}</div>

            <div className="text-xs text-gray-500">
              📍 {c.latitude ?? "-"}, {c.longitude ?? "-"}
            </div>
          </td>

          {/* STATUS */}
          <td className="px-4 py-4">
            <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[statusKey]}`}>
              {statusLabels[statusKey]}
            </span>
          </td>

          {/* PRIORITY */}
          <td className="px-4 py-4">
            <span className={`px-3 py-1 rounded-full text-xs border ${priorityColors[priorityKey]}`}>
              {priorityLabels[priorityKey]}
            </span>
          </td>

          {/* DEPARTMENT */}
          <td className="px-4 py-4">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs border">
              {departmentLabels[departmentKey]}
            </span>
          </td>

          {/* DATE */}
          <td className="px-4 py-4 text-gray-500">
            {new Date(c.createdAt).toLocaleDateString("mk-MK")}
          </td>

          {/* ACTIONS */}
          <td className="px-4 py-4">
            <button onClick={() => setSelectedComplaint(c)}>
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
      <div className="flex justify-center items-center gap-3 mt-6">

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>

          <span className="text-sm">
            Page {currentPage} / {totalPages || 1}
          </span>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
      
}