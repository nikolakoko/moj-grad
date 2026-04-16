import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

 useEffect(() => {
  if (!isAuthenticated || !user) return;

  if (user.role === 'ADMIN') {
    navigate('/admin');
  } else {
    navigate('/dashboard');
  }
}, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('Успешно се најавивте!');
      } else {
        toast.error('Невалидни податоци за најава');
      }
    } catch {
      toast.error('Грешка при најава');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">МојГрад</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Најава</CardTitle>
            <CardDescription>Најавете се за пристап до административниот панел</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="vase@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Лозинка</Label>
                <Input id="password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Се најавува...</>) : 'Најави се'}
              </Button>
            </form>

          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800 transition">← Назад кон почетна</a>
        </div>
      </div>
    </div>
  );
}