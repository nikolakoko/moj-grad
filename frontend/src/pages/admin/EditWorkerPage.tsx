import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../assets/mojgradLogo.png';

// Decode JWT payload without library
function parseJwt(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function EditWorkerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mailToken = searchParams.get('token') ?? '';

  const tokenPayload = parseJwt(mailToken);
  const emailFromToken = tokenPayload?.email ?? '';

  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};

    // Name - optional, but if filled, must be valid
    if (formData.name.trim() && formData.name.trim().length < 2)
      e.name = 'Најмалку 2 карактери';
    if (formData.name.trim().length > 40)
      e.name = 'Најмногу 40 карактери';

    // Email - optional, but if filled, must be valid
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Невалидна е-маил адреса';

    // Password - optional, but if filled, must be valid + confirm must match
    if (formData.password && formData.password.length < 6)
      e.password = 'Најмалку 6 карактери';
    if (formData.password && formData.password.length > 30)
      e.password = 'Најмногу 30 карактери';
    if (formData.password && formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Лозинките не се совпаѓаат';
    if (formData.confirmPassword && !formData.password)
      e.password = 'Внесете лозинка';

    // At least one field must be filled
    if (!formData.name.trim() && !formData.email && !formData.password) {
      e._general = 'Пополнете барем едно поле за да ажурирате';
    }

    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailToken) {
      toast.error('Невалиден линк за уредување');
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      // Build body — only send fields that are filled
      const body: Record<string, string> = {};
      if (formData.name.trim()) body.name = formData.name.trim();
      if (formData.email) body.email = formData.email;
      if (formData.password) body.password = formData.password;

      const response = await fetch('/api/auth/edit', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Mail-Token': mailToken,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Грешка при ажурирање');
      }

      setDone(true);
      toast.success('Податоците се успешно ажурирани!');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      toast.error(err?.message || 'Грешка при ажурирање на податоците');
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (errors._general) setErrors(prev => ({ ...prev, _general: '' }));
  };

  // Invalid token
  if (!mailToken || !emailFromToken) {
    return (
      <>
        <style>{styles}</style>
        <div className="rp-root">
          <div className="rp-bg-blobs"><div className="rp-blob1" /><div className="rp-blob2" /></div>
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

  // Success screen
  if (done) {
    return (
      <>
        <style>{styles}</style>
        <div className="rp-root" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="rp-bg-blobs"><div className="rp-blob1" /><div className="rp-blob2" /></div>
          <div className="rp-success-card rp-anim">
            <div className="rp-success-icon">
              <CheckCircle size={44} />
            </div>
            <h2 className="rp-success-title">Успешно ажурирање!</h2>
            <p className="rp-success-sub">
              Вашите податоци се успешно зачувани.<br />
              Ќе бидете пренасочени кон страницата за најава.
            </p>
            <div className="rp-spin-wrap">
              <Loader2 size={24} className="rp-spin" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="rp-root">
        <div className="rp-bg-blobs"><div className="rp-blob1" /><div className="rp-blob2" /></div>

        {/* Left panel */}
        <div className="rp-left">
          <div className="rp-left-inner">
            <div className="rp-logo-wrap">
              <img src={logo} alt="МојГрад" className="rp-logo-img" />
            </div>
            <h1 className="rp-left-title">МојГрад</h1>
            <p className="rp-left-tag">
              Ажурирање на вашите лични податоци за пристап до системот
            </p>
            <div className="rp-divider" />
            <ul className="rp-features">
              <li><span className="rp-dot" />Можете да го промените вашето име</li>
              <li><span className="rp-dot" />Можете да ја промените вашата е-маил адреса</li>
              <li><span className="rp-dot" />Можете да ја промените вашата лозинка</li>
              <li><span className="rp-dot" />Оставете поле празно за да не го менувате</li>
            </ul>
          </div>
        </div>

        {/* Right panel */}
        <div className="rp-right">
          <div className="rp-card rp-anim">
            <div className="rp-eyebrow">Управување со профил</div>
            <h2 className="rp-card-title">Ажурирање на податоци</h2>
            <p className="rp-card-sub">
              Ажурирање за: <strong style={{ color: '#2563eb' }}>{emailFromToken}</strong>
              <br />
              <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                Оставете поле празно за да не го менувате
              </span>
            </p>

            {errors._general && (
              <div className="rp-general-err">{errors._general}</div>
            )}

            <form onSubmit={handleSubmit} className="rp-form">

              {/* Name */}
              <div className="rp-field">
                <label className="rp-label">Ново ime <span className="rp-optional">(незадолжително)</span></label>
                <div className="rp-input-wrap">
                  <User size={15} className="rp-icon" />
                  <input
                    type="text"
                    placeholder="Оставете празно за да не менувате"
                    value={formData.name}
                    onChange={set('name')}
                    className={`rp-input ${errors.name ? 'rp-input-err' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && <span className="rp-err">{errors.name}</span>}
              </div>

              {/* New Email */}
              <div className="rp-field">
                <label className="rp-label">Нова е-маил адреса <span className="rp-optional">(незадолжително)</span></label>
                <div className="rp-input-wrap">
                  <Mail size={15} className="rp-icon" />
                  <input
                    type="email"
                    placeholder="Оставете празно за да не менувате"
                    value={formData.email}
                    onChange={set('email')}
                    className={`rp-input ${errors.email ? 'rp-input-err' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <span className="rp-err">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="rp-field">
                <label className="rp-label">Нова лозинка <span className="rp-optional">(незадолжително)</span></label>
                <div className="rp-input-wrap">
                  <Lock size={15} className="rp-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Оставете празно за да не менувате"
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
                <label className="rp-label">Потврди нова лозинка</label>
                <div className="rp-input-wrap">
                  <Lock size={15} className="rp-icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Потврди нова лозинка"
                    value={formData.confirmPassword}
                    onChange={set('confirmPassword')}
                    className={`rp-input ${errors.confirmPassword ? 'rp-input-err' : ''}`}
                    disabled={isLoading || !formData.password}
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="rp-err">{errors.confirmPassword}</span>}
                {!formData.password && (
                  <span className="rp-hint">Пополнете го полето за лозинка за да можете да потврдите</span>
                )}
              </div>

              <button type="submit" className="rp-submit" disabled={isLoading}>
                {isLoading
                  ? <><Loader2 size={16} className="rp-spin" /> Се зачувуваат...</>
                  : <><span>Зачувај промени</span><ArrowRight size={16} /></>
                }
              </button>

              <p className="rp-login-link">
                Се откажувате?{' '}
                <button type="button" onClick={() => navigate('/login')}>Назад кон најава</button>
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
    width: 110px; height: 110px;
    background: rgba(255,255,255,0.15);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.75rem;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.25);
    padding: 10px;
  }
  .rp-logo-img { width: 100%; height: 100%; object-fit: contain; }

  .rp-left-title {
    font-size: 2.25rem; font-weight: 700; color: #ffffff;
    margin: 0 0 0.75rem; line-height: 1.15; letter-spacing: -0.02em;
  }
  .rp-left-tag { color: #bfdbfe; font-size: 0.875rem; line-height: 1.75; margin: 0 0 2rem; }
  .rp-divider {
    width: 44px; height: 3px;
    background: rgba(255,255,255,0.4);
    border-radius: 99px; margin-bottom: 2rem;
  }
  .rp-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.9rem; }
  .rp-features li {
    color: #dbeafe; font-size: 0.875rem;
    display: flex; align-items: center; gap: 0.7rem; line-height: 1.5;
  }
  .rp-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,0.65); flex-shrink: 0;
  }

  .rp-right {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 3rem 2rem;
    position: relative; z-index: 1;
  }

  .rp-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 2.75rem 2.5rem;
    width: 100%; max-width: 440px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  }
  .rp-anim { animation: rpFadeUp 0.45s cubic-bezier(.22,.68,0,1.15) both; }
  @keyframes rpFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .rp-eyebrow {
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #2563eb; margin-bottom: 0.5rem;
  }
  .rp-card-title {
    font-size: 1.875rem; font-weight: 700; color: #111827;
    margin: 0 0 0.4rem; line-height: 1.2; letter-spacing: -0.02em;
  }
  .rp-card-sub { font-size: 0.875rem; color: #6b7280; margin: 0 0 1.5rem; line-height: 1.6; }

  .rp-general-err {
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 10px; padding: 0.75rem 1rem;
    font-size: 0.8rem; color: #dc2626;
    margin-bottom: 1rem;
  }

  .rp-form { display: flex; flex-direction: column; gap: 1.1rem; }
  .rp-field { display: flex; flex-direction: column; gap: 0.4rem; }
  .rp-label { font-size: 0.8rem; font-weight: 600; color: #374151; }
  .rp-optional { font-weight: 400; color: #9ca3af; font-size: 0.72rem; margin-left: 4px; }
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
    border-color: #2563eb; background: #fff;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }
  .rp-input.rp-input-err { border-color: #f87171; }
  .rp-input.rp-input-err:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.12); }
  .rp-input:disabled { opacity: 0.5; cursor: not-allowed; }

  .rp-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #9ca3af;
    padding: 2px; display: flex; align-items: center;
  }
  .rp-eye:hover { color: #4b5563; }
  .rp-err { font-size: 0.75rem; color: #ef4444; }
  .rp-hint { font-size: 0.72rem; color: #9ca3af; }

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
  .rp-success-sub { color: #6b7280; font-size: 0.875rem; margin: 0 0 1.5rem; line-height: 1.6; }
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