import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ComplaintForm } from '@/components/complaints/ComplaintForm';
import { TokenSearchModal } from '@/components/complaints/TokenSearchModal';
import { CheckCircle, Users, Clock, HelpCircle, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <TokenSearchModal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">МојГрад - Платформа за жалби</h1>
              <p className="text-xl md:text-2xl text-blue-100">
                Модерен систем за прием, обработка и решавање на жалби од граѓани преку автоматизација и вештачка интелигенција
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button onClick={() => setIsTokenModalOpen(true)} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Пребарај по токен
                </button>
                <a href="#help">
                  <button className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition border border-blue-500">
                    Дознај повеќе
                  </button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1760451265816-126b8338c18d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwaW5mcmFzdHJ1Y3R1cmV8ZW58MXx8fHwxNzc0NjkzMDMzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern City"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="flex justify-center"><CheckCircle className="w-12 h-12 text-green-600" /></div>
              <h3 className="text-3xl font-bold text-gray-900">1,247</h3>
              <p className="text-gray-600">Решени жалби</p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex justify-center"><Clock className="w-12 h-12 text-blue-600" /></div>
              <h3 className="text-3xl font-bold text-gray-900">24h</h3>
              <p className="text-gray-600">Просечно време на одговор</p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex justify-center"><Users className="w-12 h-12 text-purple-600" /></div>
              <h3 className="text-3xl font-bold text-gray-900">5,890</h3>
              <p className="text-gray-600">Задоволни граѓани</p>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint Form Section */}
      <section id="complaint" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Поднеси жалба</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Пополнете ја формата подолу за да поднесете жалба. Нашиот AI систем автоматски ќе ја класифицира и насочи кон соодветниот оддел.
            </p>
          </div>
          <ComplaintForm />
        </div>
      </section>

      {/* Help Section */}
      <section id="help" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Како функционира системот?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Поднесете жалба', desc: 'Пополнете ја формата со наслов, опис, локација и слика. Не треба да се најавувате.' },
              { num: '2', title: 'AI обработка', desc: 'Нашиот AI систем автоматски ја анализира жалбата и ѝ доделува приоритет и оддел.' },
              { num: '3', title: 'Административно решавање', desc: 'Административните работници ја прегледуваат жалбата и преземаат соодветни мерки.' },
            ].map(item => (
              <Card key={item.num}>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">{item.num}</span>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">За административни работници</h3>
            <p className="text-gray-700 mb-4">Како административен работник, имате пристап до централизиран панел каде можете:</p>
            <ul className="space-y-2 text-gray-700">
              {[
                'Да ги прегледувате сите жалби од вашиот оддел',
                'Да ги филтрирате и сортирате жалбите според статус, приоритет и оддел',
                'Да вршите измени на статус, приоритет и оддел',
                'Да импортирате жалби преку CSV/Excel документи',
                'Да генерирате извештаи и експортирате податоци',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Контакт информации</h2>
            <p className="text-lg text-gray-600">Имате прашања? Слободно контактирајте не!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card><CardContent className="pt-6 text-center"><Mail className="w-10 h-10 text-blue-600 mx-auto mb-4" /><h3 className="font-semibold text-gray-900 mb-2">Email</h3><p className="text-gray-600">info@mojgrad.mk</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><Phone className="w-10 h-10 text-blue-600 mx-auto mb-4" /><h3 className="font-semibold text-gray-900 mb-2">Телефон</h3><p className="text-gray-600">+389 2 123 4567</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><MapPin className="w-10 h-10 text-blue-600 mx-auto mb-4" /><h3 className="font-semibold text-gray-900 mb-2">Адреса</h3><p className="text-gray-600">Скопје, Македонија</p></CardContent></Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg"><MapPin className="w-6 h-6" /></div>
              <span className="text-xl font-semibold">МојГрад</span>
            </div>
            <p className="text-gray-400">© 2026 МојГрад. Сите права задржани.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}