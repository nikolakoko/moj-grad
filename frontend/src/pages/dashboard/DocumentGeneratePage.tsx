import { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/apiClient';

export default function DocumentGeneratePage() {
  const { complaints } = useComplaints();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    setGenerated(false);

    try {
      const token = localStorage.getItem('token');

      // GET /api/complaints/export — backend враќа CSV директно
      const response = await fetch(buildApiUrl('/complaints/export'), {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Грешка при експорт');
      }

      // Земи го Content-Disposition header за да го добиеш filename-от
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `zalbi-${Date.now()}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]*)\1/);
        if (match?.[2]) filename = match[2];
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setGenerated(true);
      toast.success('Документот е успешно генериран!');
      setTimeout(() => setGenerated(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Грешка при генерирање на документот');
    } finally {
      setIsGenerating(false);
    }
  };

  const fields = [
    'ID на жалба',
    'Наслов и детален опис',
    'Тековен статус',
    'Приоритет',
    'Доделен оддел',
    'Локација (координати)',
    'Датум на креирање',
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Генерирај документ</h1>
            <p className="text-gray-500 mt-1">Експортирајте жалби во CSV формат</p>
          </div>

          {/* Stats banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white flex items-center gap-5 shadow-md">
            <div className="bg-white/20 rounded-xl p-3">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Вкупно жалби за експорт</p>
              <p className="text-4xl font-bold">{complaints.length}</p>
            </div>
          </div>

          {/* Format info */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Формат на извоз</CardTitle>
              <CardDescription>Жалбите се извезуваат во CSV формат</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* CSV format card */}
              <div className="rounded-xl border-2 border-blue-500 bg-blue-50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">.csv</span>
                </div>
                <p className="font-semibold text-gray-800 text-sm">CSV формат</p>
                <p className="text-xs text-gray-500 mt-0.5">Лесен за отворање во секој уредувач</p>
              </div>

              {/* Success message */}
              {generated && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm font-medium">Документот е успешно генериран и симнат!</p>
                </div>
              )}

              {/* Export button */}
              <Button
                onClick={handleExport}
                disabled={isGenerating || complaints.length === 0}
                className="w-full h-12 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isGenerating
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />Се генерира...</>
                  : <><Download className="w-5 h-5 mr-2 text-white" />Генерирај и симни документ</>
                }
              </Button>

              {complaints.length === 0 && (
                <p className="text-center text-sm text-gray-400">Нема жалби за експорт.</p>
              )}
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Содржина на документот</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {fields.map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 border-t pt-4">
                <strong className="text-gray-500">Напомена:</strong> Документот е соодветен за анализа, архивирање и интеграција со други системи.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
