import { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function AddWorkerPage() {
  const [isInviting, setIsInviting] = useState(false);
  const [invited, setInvited] = useState(false);
  const [email, setEmail] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Невалидна email адреса');
      return;
    }

    setIsInviting(true);
    try {
      await apiClient('/admin/workers/invite', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setInvitedEmail(email);
      setInvited(true);
      toast.success('Поканата е испратена успешно!');

      setTimeout(() => {
        setEmail('');
        setInvited(false);
        setInvitedEmail('');
      }, 3000);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('already associated with an account')) {
        toast.error('Работник со овој email веќе постои');
      } else {
        toast.error(msg || 'Грешка при испраќање покана');
      }
    } finally {
      setIsInviting(false);
    }
  };

  if (invited) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-2xl shadow-lg border-0">
            <CardContent className="pt-14 pb-14 px-10">
              <div className="text-center space-y-5">
                <div className="flex justify-center">
                  <div className="bg-green-100 rounded-full p-5">
                    <CheckCircle className="w-14 h-14 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Поканата е успешно испратена!
                </h3>
                <p className="text-gray-500 text-sm">
                  Email порака е испратена на <strong className="text-gray-800">{invitedEmail}</strong> со инструкции за регистрација.
                </p>
                <div className="bg-gray-50 rounded-xl p-5 mt-4 border border-gray-100 text-left space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-800">{invitedEmail}</span>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Статус</span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">INVITED</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-4 mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Додај работник
            </h1>
            <p className="text-gray-500">
              Поканете нов административен работник преку email
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="pt-8 pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email адреса
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="rabotnik@mojgrad.mk"
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Што се случува потоа?</p>
                  <ul className="text-sm text-blue-700 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">📧</span>
                      <span>Email порака ќе биде испратена со линк за регистрација</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">🔑</span>
                      <span>Работникот ќе креира лозинка и ќе го активира профилот</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">✅</span>
                      <span>Статусот ќе се промени од INVITED на REGISTERED</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold"
                  disabled={isInviting}
                >
                  {isInviting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Се испраќа покана...</>
                    : <><UserPlus className="w-4 h-4 mr-2" />Испрати покана</>
                  }
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}