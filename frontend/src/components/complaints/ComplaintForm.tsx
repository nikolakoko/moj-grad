import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
 
declare global {
  interface Window {
    L: any;
  }
}
 
// ─── Map Picker ────────────────────────────────────────────────────────────────
 
function useLeaflet(onReady: () => void) {
  useEffect(() => {
    // Inject CSS once
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css';
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
 
    // If already loaded, fire immediately
    if (window.L) {
      onReady();
      return;
    }
 
    // Otherwise inject script
    const existing = document.getElementById('leaflet-js');
    if (existing) {
      // Script tag exists but not yet loaded — wait for it
      existing.addEventListener('load', onReady);
      return;
    }
 
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = onReady;
    document.head.appendChild(script);
  }, [onReady]);
}
 
interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLat: number | null;
  selectedLng: number | null;
}
 
function MapPicker({ onLocationSelect, selectedLat, selectedLng }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
 
  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;
 
    const L = window.L;
 
    // Fix default marker icons broken by bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
 
    const map = L.map(containerRef.current, {
      center: [41.9973, 21.428],
      zoom: 13,
      zoomControl: true,
    });
 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
 
    map.on('click', (e: any) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
 
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
 
      onLocationSelect(lat, lng);
    });
 
    mapRef.current = map;
    // Ensure map renders correctly inside flex/card containers
    setTimeout(() => map.invalidateSize(), 150);
  }, [onLocationSelect]);
 
  useLeaflet(initMap);
 
  // If user already selected coords, place marker when map is ready
  useEffect(() => {
    if (!mapRef.current || selectedLat === null || selectedLng === null) return;
    const L = window.L;
    if (markerRef.current) {
      markerRef.current.setLatLng([selectedLat, selectedLng]);
    } else {
      markerRef.current = L.marker([selectedLat, selectedLng]).addTo(mapRef.current);
    }
  }, [selectedLat, selectedLng]);
 
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div
        ref={containerRef}
        style={{ height: '300px', width: '100%' }}
      />
    </div>
  );
}
 
// ─── Complaint Form ─────────────────────────────────────────────────────────────
 
export function ComplaintForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintToken, setComplaintToken] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
 
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);
 
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip "data:image/...;base64," prefix — backend expects raw base64
      setImageBase64(result.split(',')[1]);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };
 
  const removeImage = () => {
    setImageBase64(null);
    setImagePreview(null);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (latitude === null || longitude === null) {
      toast.error('Ве молиме кликнете на мапата за да ја одберете локацијата');
      return;
    }
 
    setIsSubmitting(true);
    try {
      const response = await apiClient('/complaints/create', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          latitude,
          longitude,
          photo: imageBase64 ?? null,
        }),
      });
 
      setComplaintToken(response.token);
      setSubmitted(true);
      toast.success('Жалбата е успешно поднесена!');
    } catch (err: any) {
      toast.error(err?.message || 'Грешка при поднесување на жалба');
    } finally {
      setIsSubmitting(false);
    }
  };
 
  const handleReset = () => {
    setTitle('');
    setDescription('');
    setImageBase64(null);
    setImagePreview(null);
    setLatitude(null);
    setLongitude(null);
    setSubmitted(false);
    setComplaintToken('');
  };
 
  // ── Success screen ──
  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto rounded-2xl shadow-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h3 className="text-2xl font-semibold text-gray-900">Жалбата е успешно поднесена</h3>
            <p className="text-gray-600">
              Вашата жалба е примена и веќе е обработена од нашиот систем.
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 justify-center text-blue-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Ваш токен за следење на жалбата:</span>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
                <p className="text-3xl font-bold text-blue-600 tracking-wider">{complaintToken}</p>
              </div>
              <p className="text-sm text-blue-700">
                Зачувајте го овој токен за да можете да го проверите статусот на вашата жалба.
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" className="rounded-xl mt-2">
              Поднеси нова жалба
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
 
  // ── Form ──
  return (
    <Card className="max-w-2xl mx-auto rounded-2xl shadow-md border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">Поднеси жалба</CardTitle>
        <CardDescription>
          Пополнете ја формата за да поднесете жалба. Нашиот систем автоматски ќе ја обработи и ќе ја насочи кон соодветниот оддел.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
 
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Наслов *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Кратко опишете го проблемот"
              maxLength={50}
              required
              className="bg-gray-100 border-0 rounded-xl h-11 focus-visible:ring-1"
            />
            <p className="text-xs text-gray-400 text-right">{title.length}/50</p>
          </div>
 
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Детален опис на проблемот"
              rows={4}
              maxLength={200}
              required
              className="bg-gray-100 border-0 rounded-xl focus-visible:ring-1 resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{description.length}/200</p>
          </div>
 
          {/* Map */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Локација *
              {latitude !== null ? (
                <span className="text-xs font-normal text-green-600">
                  ✓ {latitude}, {longitude}
                </span>
              ) : (
                <span className="text-xs font-normal text-gray-400">кликнете на мапата</span>
              )}
            </Label>
            <MapPicker
              onLocationSelect={handleLocationSelect}
              selectedLat={latitude}
              selectedLng={longitude}
            />
          </div>
 
          {/* Image */}
          <div className="space-y-2">
            <Label>Прикачи слика (опционално)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow hover:bg-gray-100 transition"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="flex items-center gap-2 w-fit px-4 py-2 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Избери слика</span>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
 
          <Button
            type="submit"
            className="w-full rounded-xl h-12 text-base bg-gray-900 hover:bg-gray-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Се поднесува...</>
            ) : (
              'Поднеси жалба'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}