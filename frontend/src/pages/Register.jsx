import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import { Zap, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const { dark } = useTheme();
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow]   = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const checks = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'Passwords match',        ok: form.password && form.password === form.confirm },
  ];

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setError(''); setLoading(true);
    try {
      const { data } = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left Panel */}
      <div className={`hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden transition-all duration-500
        ${dark ? 'bg-gradient-to-br from-slate-900 via-accent/20 to-slate-900' : 'bg-gradient-to-br from-white via-accent/10 to-white border-r border-slate-200'}`}>
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent/40 animate-pulse-glow">
            <Zap size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Start Your Journey</h1>
          <p className="text-slate-400 text-lg max-w-sm">Join thousands tracking their fitness goals. Free forever.</p>
          <div className="mt-10 space-y-3">
            {['Track unlimited workouts & steps', 'Set and crush your fitness goals', 'Compete with friends on leaderboards', 'Earn badges for achievements'].map(t => (
              <div key={t} className="flex items-center gap-3 text-left">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in py-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FitTracker Pro</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Create account</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Begin your fitness transformation today</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="name" value={form.name} onChange={handle}
                  className="input pl-10" placeholder="John Doe" required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="email" type="email" value={form.email} onChange={handle}
                  className="input pl-10" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="password" type={show ? 'text' : 'password'} value={form.password} onChange={handle}
                  className="input pl-10 pr-10" placeholder="Min. 8 characters" required />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="confirm" type={show ? 'text' : 'password'} value={form.confirm} onChange={handle}
                  className="input pl-10" placeholder="Repeat password" required />
              </div>
            </div>
            {/* Password checklist */}
            {form.password && (
              <div className="space-y-1">
                {checks.map(({ label, ok }) => (
                  <div key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 size={13} /> {label}
                  </div>
                ))}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:text-primary font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
