import { Link } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">МојГрад</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#complaint" className="text-gray-600 hover:text-gray-900 transition">
              Поднеси жалба
            </a>
            <a href="#help" className="text-gray-600 hover:text-gray-900 transition">
              Помош
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">
              Контакт
            </a>
            <Link to="/login">
              <Button>Најави се</Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <a href="#complaint" className="block py-2 text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
              Поднеси жалба
            </a>
            <a href="#help" className="block py-2 text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
              Помош
            </a>
            <a href="#contact" className="block py-2 text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
              Контакт
            </a>
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full">Најави се</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}