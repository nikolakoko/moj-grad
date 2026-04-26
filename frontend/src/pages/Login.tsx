import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import logo from '../assets/mojgradLogo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Внеси email и лозинка");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);

      if (success) {
        toast.success("Успешно се најавивте!");
      } else {
        toast.error("Невалидни податоци за најава");
      }
    } catch (err) {
      toast.error("Грешка при најава");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="МојГрад" className="w-16 h-16 object-contain" />
            <span className="text-3xl font-bold text-gray-900 leading-none">
              МојГрад
            </span>
          </div>
        </div>

        {/* CARD */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Најава</CardTitle>
            <CardDescription>
              Најавете се за пристап до системот
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label>Лозинка</Label>
                <Input
                  type="password"
                  placeholder=""
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* BUTTON */}
              <Button
                  type="submit"
                  className="w-full flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-busy={isLoading}
              >
                {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Се најавува...
                    </>
                ) : (
                    "Најави се"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* BACK */}
        <div className="mt-6 text-center">
          <a
              href="/"
              className="inline-block text-sm text-blue-600 hover:text-blue-800 hover:scale-110"
          >
            ← Назад
          </a>
        </div>

      </div>
    </div>
  );
}