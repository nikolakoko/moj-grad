import { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';

export default function DocumentGeneratePage() {
  const { complaints } = useComplaints();
  const [format, setFormat] = useState<'csv' | 'excel'>('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerated(false);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const headers = ['ID', 'Наслов', 'Опис', 'Статус', 'Приоритет', 'Оддел', 'Локација', 'Датум'];
    const rows = complaints.map(c => [
      c.id, c.title, c.description, c.status, c.priority, c.department,
      c.location.address || `${c.location.latitude}, ${c.location.longitude}`,
      new Date(c.createdAt).toLocaleDateString('mk-MK')
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zalbi-${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsGenerating(false);
    setGenerated(true);
    toast.success('Документот е успешно генериран!');
    setTimeout(() => setGenerated(false), 3000);
  };

  const formatOptions = [
    {
      value: 'csv',
      label: 'CSV формат',
      ext: '.csv',
      icon: FileText,
      description: 'Лесен за отворање во секој уредувач',
      color: 'blue',
    },
    {
      value: 'excel',
      label: 'Excel формат',
      ext: '.xlsx',
      icon: FileSpreadsheet,
      description: 'Идеален за анализа и сортирање',
      color: 'green',
    },
  ] as const;

  const fields = [
    'ID на жалба',
    'Наслов и детален опис',
    'Тековен статус',
    'Приоритет',
    'Доделен оддел',
    'Локација (адреса или координати)',
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
            <p className="text-gray-500 mt-1">Експортирајте жалби во CSV или Excel формат</p>
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

          {/* Format picker */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Изберете формат</CardTitle>
              <CardDescription>Изберете во кој формат сакате да го симнете документот</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {formatOptions.map(({ value, label, ext, icon: Icon, description, color }) => {
                  const isSelected = format === value;
                  const colorMap = {
                    blue: {
                      border: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
                      icon: 'text-blue-600',
                      badge: 'bg-blue-100 text-blue-700',
                    },
                    green: {
                      border: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
                      icon: 'text-green-600',
                      badge: 'bg-green-100 text-green-700',
                    },
                  };
                  const c = colorMap[color];
                  return (
                    <button
                      key={value}
                      onClick={() => setFormat(value)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${c.border}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-6 h-6 ${c.icon}`} />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{ext}</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Success message */}
              {generated && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm font-medium">Документот е успешно генериран и симнат!</p>
                </div>
              )}

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
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