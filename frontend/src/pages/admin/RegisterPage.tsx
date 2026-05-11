import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../assets/mojgradLogo.png';
import { useAuth } from '@/context/AuthContext';
import { buildApiUrl } from '@/lib/apiClient';

// Decode JWT payload without a library
function parseJwt(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const mailToken = searchParams.get('token') ?? '';

  const tokenPayload = parseJwt(mailToken);
  const emailFromToken = tokenPayload?.email ?? '';

  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({ name: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      e.name = 'Најмалку 2 карактери';
    if (formData.name.trim().length > 40)
      e.name = 'Најмногу 40 карактери';
    if (!formData.password || formData.password.length < 6)
      e.password = 'Најмалку 6 карактери';
    if (formData.password.length > 30)
      e.password = 'Најмногу 30 карактери';
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Лозинките не се совпаѓаат';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailToken) { toast.error('Невалиден линк за регистрација'); return; }
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setErrors({});
    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Mail-Token': mailToken },
        body: JSON.stringify({ name: formData.name.trim(), password: formData.password }),
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Грешка при регистрација');
      }
      logout();
      setDone(true);
      toast.success('Регистрацијата е успешна!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.message || 'Грешка при регистрација');
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };



  if (!mailToken) {
    return (
      <>
        <style>{styles}</style>
        <div className="rp-root">
          <div className="rp-bg-blobs"><div className="rp-blob1"/><div className="rp-blob2"/></div>
          <div className="rp-card rp-anim" style={{ textAlign: 'center', padding: '3rem 2.5rem', maxWidth: '420px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⛔</div>
            <h2 className="rp-card-title" style={{ marginBottom: '0.75rem' }}>Невалиден линк</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Линкот е невалиден или истечен.<br />Контактирајте го администраторот.
            </p>
            <button className="rp-back-btn" onClick={() => navigate('/login')} style={{ marginTop: '1.5rem' }}>
              ← Назад кон најава
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="rp-root">
        <div className="rp-bg-blobs"><div className="rp-blob1"/><div className="rp-blob2"/></div>

        {/* Left panel */}
        <div className="rp-left">
          <div className="rp-left-inner">
            <div className="rp-logo-wrap">
              <img src={logo} alt="МојГрад" className="rp-logo-img" />
            </div>
            <h1 className="rp-left-title">МојГрад</h1>
            <p className="rp-left-tag">
              Модерен систем за прием, обработка и решавање на жалби од граѓани преку автоматизација и вештачка интелигенција
            </p>
            <div className="rp-divider" />
            <ul className="rp-features">
              <li><span className="rp-dot" />Пријавете проблеми во вашата општина</li>
              <li><span className="rp-dot" />Следете го статусот на вашите пријави</li>
              <li><span className="rp-dot" />Соработувајте со општинските служби</li>
            </ul>
          </div>
        </div>

        {/* Right panel */}
        <div className="rp-right">
          <div className="rp-card rp-anim">
            <div className="rp-eyebrow">Активирање на профил</div>
            <h2 className="rp-card-title">Регистрација</h2>
            <p className="rp-card-sub">Внесете ги вашите податоци за да го активирате профилот</p>

            <form onSubmit={handleSubmit} className="rp-form">

              {/* Name */}
              <div className="rp-field">
                <label className="rp-label">Име</label>
                <div className="rp-input-wrap">
                  <User size={15} className="rp-icon" />
                  <input
                    type="text"
                    placeholder="Име Презиме"
                    value={formData.name}
                    onChange={set('name')}
                    className={`rp-input ${errors.name ? 'rp-input-err' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && <span className="rp-err">{errors.name}</span>}
              </div>

              {/* Email — read-only, from token */}
              <div className="rp-field">
                <label className="rp-label">Е-маил</label>
                <div className="rp-input-wrap">
                  <Mail size={15} className="rp-icon" />
                  <input
                    type="email"
                    value={emailFromToken}
                    className="rp-input rp-input-readonly"
                    readOnly
                    tabIndex={-1}
                  />
                </div>
                <span className="rp-hint">Е-маилот е поврзан со вашата покана</span>
              </div>

              {/* Password */}
              <div className="rp-field">
                <label className="rp-label">Лозинка</label>
                <div className="rp-input-wrap">
                  <Lock size={15} className="rp-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Минимум 6 карактери"
                    value={formData.password}
                    onChange={set('password')}
                    className={`rp-input ${errors.password ? 'rp-input-err' : ''}`}
                    disabled={isLoading}
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <span className="rp-err">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="rp-field">
                <label className="rp-label">Потврди лозинка</label>
                <div className="rp-input-wrap">
                  <Lock size={15} className="rp-icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Потврди лозинка"
                    value={formData.confirmPassword}
                    onChange={set('confirmPassword')}
                    className={`rp-input ${errors.confirmPassword ? 'rp-input-err' : ''}`}
                    disabled={isLoading}
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="rp-err">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="rp-submit" disabled={isLoading}>
                {isLoading
                  ? <><Loader2 size={16} className="rp-spin" /> Се регистрира...</>
                  : <><span>Регистрирај се</span><ArrowRight size={16} /></>
                }
              </button>

              <p className="rp-login-link">
                Веќе имате профил?{' '}
                <button type="button" onClick={() => navigate('/login')}>Најавете се</button>
              </p>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .rp-root {
    min-height: 100vh;
    display: flex;
    background: #f3f4f6;
    font-family: 'Inter', system-ui, sans-serif;
    position: relative;
    overflow: hidden;
  }

  .rp-bg-blobs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .rp-blob1 {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
    top: -150px; right: -100px;
  }
  .rp-blob2 {
    position: absolute; width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(29,78,216,0.07) 0%, transparent 70%);
    bottom: -100px; left: -80px;
  }

  /* LEFT PANEL */
  .rp-left {
    flex: 0 0 44%;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 3.5rem;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }
  .rp-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
    background-size: 28px 28px;
  }
  .rp-left::after {
    content: '';
    position: absolute;
    width: 350px; height: 350px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
    bottom: -80px; left: -80px;
    pointer-events: none;
  }

  .rp-left-inner { position: relative; z-index: 1; max-width: 340px; }

  .rp-logo-wrap {
    width: 110px;
    height: 110px;
    background: rgba(255,255,255,0.15);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.75rem;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.25);
    padding: 10px;
  }
  .rp-logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .rp-left-title {
    font-size: 2.25rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.75rem;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }
  .rp-left-tag {
    color: #bfdbfe;
    font-size: 0.875rem;
    line-height: 1.75;
    margin: 0 0 2rem;
  }
  .rp-divider {
    width: 44px; height: 3px;
    background: rgba(255,255,255,0.4);
    border-radius: 99px;
    margin-bottom: 2rem;
  }
  .rp-features {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.9rem;
  }
  .rp-features li {
    color: #dbeafe;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    line-height: 1.5;
  }
  .rp-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,0.65);
    flex-shrink: 0;
  }

  /* RIGHT PANEL */
  .rp-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    position: relative;
    z-index: 1;
  }

  /* CARD */
  .rp-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 2.75rem 2.5rem;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  }
  .rp-anim { animation: rpFadeUp 0.45s cubic-bezier(.22,.68,0,1.15) both; }
  @keyframes rpFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .rp-eyebrow {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #2563eb;
    margin-bottom: 0.5rem;
  }
  .rp-card-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.4rem;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .rp-card-sub {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0 0 2rem;
    line-height: 1.6;
  }

  /* FORM */
  .rp-form { display: flex; flex-direction: column; gap: 1.2rem; }
  .rp-field { display: flex; flex-direction: column; gap: 0.4rem; }
  .rp-label { font-size: 0.8rem; font-weight: 600; color: #374151; }
  .rp-input-wrap { position: relative; }
  .rp-icon {
    position: absolute; left: 13px; top: 50%;
    transform: translateY(-50%); color: #9ca3af; pointer-events: none;
  }
  .rp-input {
    width: 100%; height: 46px;
    padding: 0 40px 0 38px;
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.875rem;
    font-family: 'Inter', system-ui, sans-serif;
    color: #111827;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .rp-input::placeholder { color: #c1c9d4; }
  .rp-input:focus {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }
  .rp-input.rp-input-err { border-color: #f87171; }
  .rp-input.rp-input-err:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.12); }
  .rp-input-readonly {
    background: #f3f4f6 !important;
    color: #6b7280 !important;
    cursor: default;
    border-color: #e5e7eb !important;
    box-shadow: none !important;
  }

  .rp-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #9ca3af;
    padding: 2px; display: flex; align-items: center;
  }
  .rp-eye:hover { color: #4b5563; }
  .rp-err { font-size: 0.75rem; color: #ef4444; }
  .rp-hint { font-size: 0.72rem; color: #9ca3af; }

  /* Submit */
  .rp-submit {
    height: 48px; width: 100%;
    background: #2563eb;
    color: white; border: none; border-radius: 10px;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.9rem; font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(37,99,235,0.3);
    margin-top: 0.25rem;
  }
  .rp-submit:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  }
  .rp-submit:active:not(:disabled) { transform: translateY(0); }
  .rp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .rp-login-link {
    text-align: center; font-size: 0.82rem; color: #6b7280; margin: 0;
  }
  .rp-login-link button {
    background: none; border: none; cursor: pointer;
    color: #2563eb; font-weight: 600; font-size: 0.82rem;
    padding: 0; font-family: 'Inter', system-ui, sans-serif;
  }
  .rp-login-link button:hover { text-decoration: underline; }

  /* SUCCESS */
  .rp-success-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 3.5rem 2.5rem;
    text-align: center;
    max-width: 420px; width: 100%;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    position: relative; z-index: 1;
  }
  .rp-success-icon {
    width: 88px; height: 88px; border-radius: 50%;
    background: #dbeafe;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem; color: #2563eb;
    box-shadow: 0 4px 16px rgba(37,99,235,0.15);
  }
  .rp-success-title {
    font-size: 1.75rem; font-weight: 700; color: #111827;
    margin: 0 0 0.5rem; letter-spacing: -0.02em;
  }
  .rp-success-sub { color: #6b7280; font-size: 0.875rem; margin: 0 0 1.5rem; }
  .rp-spin-wrap { display: flex; justify-content: center; color: #2563eb; }

  .rp-back-btn {
    background: none;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.6rem 1.4rem;
    cursor: pointer;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.85rem; color: #374151; font-weight: 500;
    transition: border-color 0.2s, background 0.2s;
  }
  .rp-back-btn:hover { border-color: #2563eb; background: #eff6ff; }

  .rp-spin { animation: rpSpin 1s linear infinite; display: inline-block; }
  @keyframes rpSpin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .rp-left { display: none; }
    .rp-right { padding: 2rem 1.25rem; }
    .rp-card { padding: 2rem 1.5rem; }
  }
`;
