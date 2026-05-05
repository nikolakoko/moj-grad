import { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { useComplaints } from '@/context/ComplaintContext';
import { toast } from 'sonner';

export default function DocumentUploadPage() {
  const { fetchComplaints } = useComplaints();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Фајлот е преголем. Максимална големина: 10MB');
        return;
      }
      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');

      // POST /api/complaints/import — multipart/form-data со "file" part
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/complaints/import', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // НЕ поставувај Content-Type — браузерот сам го поставува со boundary за multipart
        },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Грешка при увоз на жалбите');
      }

      // Refresh complaints во контекстот по успешен import
      await fetchComplaints();

      setUploadStatus('success');
      toast.success('Жалбите се успешно внесени!');
      setTimeout(() => {
        setFile(null);
        setUploadStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Import error:', error);
      const msg = error instanceof Error ? error.message : 'Невалидна структура на фајлот.';
      setErrorMessage(msg);
      setUploadStatus('error');
      toast.error('Грешка при обработка на документот');
    } finally {
      setIsUploading(false);
    }
  };

  const columns = [
    ['title', 'Наслов на жалбата'],
    ['description', 'Детален опис'],
    ['address', 'Адреса'],
    ['latitude', 'Географска ширина (опционално)'],
    ['longitude', 'Географска должина (опционално)'],
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Прикачување жалби</h1>
            <p className="text-gray-500 mt-1">Импортирајте жалби од CSV документи</p>
          </div>

          {/* Stats banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white flex items-center gap-5 shadow-md">
            <div className="bg-white/20 rounded-xl p-3">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Поддржани формати</p>
              <p className="text-2xl font-bold">.csv</p>
            </div>
          </div>

          {/* Upload card */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Прикачи документ</CardTitle>
              <CardDescription>Изберете CSV фајл кој содржи жалби</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Drop zone */}
              <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
              }`}>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    {file ? (
                      <>
                        <div className="bg-blue-100 rounded-full p-4">
                          <FileSpreadsheet className="w-10 h-10 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <span className="text-xs text-blue-600 underline">Изберете друг фајл</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-100 rounded-full p-4">
                          <Upload className="w-10 h-10 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">Кликнете за да изберете фајл</p>
                          <p className="text-sm text-gray-500 mt-1">Само .csv фајлови, максимум 10MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Status messages */}
              {uploadStatus === 'success' && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm font-medium">Жалбите се успешно внесени во системот!</p>
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 text-sm font-semibold">Грешка при обработка на документот</p>
                    <p className="text-red-700 text-xs mt-1">{errorMessage || 'Невалидна структура на фајлот.'}</p>
                  </div>
                </div>
              )}

              {/* Upload button */}
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full h-12 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isUploading
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />Се прикачува...</>
                  : <><Upload className="w-5 h-5 mr-2 text-white" />Прикачи документ</>
                }
              </Button>

            </CardContent>
          </Card>

          {/* Format info card */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Формат на документот</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">Документот треба да содржи следните колони:</p>
              <div className="space-y-2">
                {columns.map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-blue-600 font-semibold text-sm min-w-[120px]">{key}</span>
                    <span className="text-gray-600 text-sm">{val}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 border-t pt-4">
                <strong className="text-gray-500">Напомена:</strong> AI системот автоматски ќе ги доделува приоритет и оддел на секоја жалба.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}