import {useState, useEffect} from 'react'; // Added useEffect
import {Search, CheckCircle, Clock, XCircle, MapPin, Calendar, X, Loader2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {apiClient} from '@/lib/apiClient';

interface TokenSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ComplaintResponse {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    complaintStatus: string;
    priority: string;
    photo?: string;
    departmentName: string;
    createdAt: string;
}

const statusLabels: Record<string, string> = {
    PENDING: 'Поднесена',
    IN_PROGRESS: 'Прифатена',
    RESOLVED: 'Решена',
    REJECTED: 'Одбиена',
};

const priorityLabels: Record<string, string> = {
    LOW: 'Низок',
    MEDIUM: 'Среден',
    HIGH: 'Висок',
};

const statusColors: Record<string, string> = {
    RESOLVED: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
};

const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-gray-100 text-gray-800',
};

export function TokenSearchModal({isOpen, onClose}: TokenSearchModalProps) {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [foundComplaint, setFoundComplaint] = useState<ComplaintResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // LOGIC TO DISABLE SCROLL
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup: restore scroll if the component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSearched(false);
        setFoundComplaint(null);
        setError(null);

        try {
            const result = await apiClient(`/complaints/by-token?token=${encodeURIComponent(token.trim())}`);
            setFoundComplaint(result);
        } catch {
            setError('Не постои жалба со овој токен.');
        } finally {
            setIsLoading(false);
            setSearched(true);
        }
    };

    const handleClose = () => {
        setToken('');
        setSearched(false);
        setFoundComplaint(null);
        setError(null);
        onClose();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return <CheckCircle className="w-6 h-6 text-green-600"/>;
            case 'IN_PROGRESS':
                return <Clock className="w-6 h-6 text-blue-600"/>;
            case 'REJECTED':
                return <XCircle className="w-6 h-6 text-red-600"/>;
            default:
                return <Clock className="w-6 h-6 text-yellow-600"/>;
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Непознат датум';
        try {
            return new Date(dateStr).toLocaleDateString('mk-MK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}/>
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-500"/>
                </button>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold">Пребарај по токен</h2>
                    <p className="text-blue-100 mt-2">Внесете го токенот што го добивте при поднесување на жалбата.</p>
                </div>

                <div className="p-8 space-y-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="modal-token">Токен</Label>
                            <Input
                                id="modal-token"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                placeholder="xxxxxxxxxx"
                                className="text-sm tracking-wider font-mono"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Пребарување...</>
                                : <><Search className="w-4 h-4 mr-2"/>Пребарај</>
                            }
                        </Button>
                    </form>

                    {searched && (
                        <>
                            {foundComplaint ? (
                                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50/50 space-y-6">
                                    <div className="flex items-start gap-3">
                                        {getStatusIcon(foundComplaint.complaintStatus)}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{foundComplaint.title}</h3>
                                            <p className="text-sm text-gray-500 font-mono mt-0.5 break-all">Токен: {token}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Опис</h4>
                                        <p className="text-gray-700">{foundComplaint.description}</p>
                                    </div>

                                    {foundComplaint.latitude && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"/>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">Локација</h4>
                                                <p className="text-gray-700 text-sm">
                                                    {foundComplaint.latitude}, {foundComplaint.longitude}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"/>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">Датум на
                                                поднесување</h4>
                                            <p className="text-gray-700">{formatDate(foundComplaint.createdAt)}</p>
                                        </div>
                                    </div>

                                    {foundComplaint.photo && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Слика</h4>
                                            <img
                                                src={foundComplaint.photo.startsWith('http')
                                                    ? foundComplaint.photo
                                                    : `data:image/jpeg;base64,${foundComplaint.photo}`}
                                                alt={foundComplaint.title}
                                                className="rounded-lg w-full object-contain"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Статус</p>
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[foundComplaint.complaintStatus] ?? 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[foundComplaint.complaintStatus] ?? foundComplaint.complaintStatus}
                      </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Приоритет</p>
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${priorityColors[foundComplaint.priority] ?? 'bg-gray-100 text-gray-800'}`}>
                        {priorityLabels[foundComplaint.priority] ?? foundComplaint.priority}
                      </span>
                                        </div>
                                        <div className="col-span-1">
                                            <p className="text-sm text-gray-600 mb-1">Оддел</p>
                                            <p className="text-sm font-semibold truncate text-gray-900">{foundComplaint.departmentName}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-red-50 rounded-xl border border-red-100">
                                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3"/>
                                    <p className="text-red-800 font-medium">{error}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
