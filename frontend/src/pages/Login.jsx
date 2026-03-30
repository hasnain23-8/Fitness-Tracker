import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { dark } = useTheme();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [show, setShow]   = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left Panel */}
      <div className={`hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden transition-all duration-500
        ${dark ? 'bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900' : 'bg-gradient-to-br from-white via-primary/10 to-white border-r border-slate-200'}`}>
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40 animate-pulse-glow">
            <Zap size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">FitTracker Pro</h1>
          <p className="text-slate-400 text-lg max-w-sm">Your complete fitness journey — workouts, steps, goals, friends, and more.</p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[['💪','Track Workouts'],['👣','Count Steps'],['🎯','Set Goals'],['👥','Athlete Board']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 dark:bg-slate-800/20 rounded-xl px-4 py-3 border border-slate-200 dark:border-white/10 shadow-sm">
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FitTracker Pro</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Sign in to continue your fitness journey</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
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
                  className="input pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-light hover:text-primary font-medium">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
