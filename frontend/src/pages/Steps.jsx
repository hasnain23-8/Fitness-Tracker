import { useState, useEffect } from 'react';
import { stepsAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { getLocalDate, formatToLocalDate } from '../utils/dateUtils';
import { Footprints, Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const GOAL = 10000;

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`${dark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'} border rounded-xl px-4 py-3 shadow-xl text-xs`}>
      <p className="mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Steps() {
  const { dark } = useTheme();
  const [steps,   setSteps]   = useState([]);
  const [weekly,  setWeekly]  = useState([]);
  const [form,    setForm]    = useState({ step_count: '', step_date: getLocalDate() });
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [a, b] = await Promise.all([stepsAPI.getAll(), stepsAPI.weekly()]);
    setSteps(a.data);
    setWeekly(b.data.map(d => ({ date: d.date?.split('T')[0]?.slice(5), steps: d.step_count })));
  };

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try { await stepsAPI.add(form); await load(); setForm(f => ({ ...f, step_count: '' })); }
    catch {} finally { setLoading(false); }
  };

  const remove = async id => { await stepsAPI.remove(id); load(); };

  // Use local date for TODAY comparison
  const todayStr   = getLocalDate();
  const todayEntry = steps.find(s => formatToLocalDate(s.step_date) === todayStr);
  const todaySteps = todayEntry ? todayEntry.step_count : 0;
  const pct = Math.min(Math.round((todaySteps / GOAL) * 100), 100);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="page-title !text-slate-900 dark:!text-white">Step Tracker</h1>
        <p className="text-slate-500 text-sm font-medium">10,000 steps a day keeps the doctor away</p>
      </div>

      {/* Today Ring + Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Progress */}
        <div className="card flex flex-col items-center justify-center py-8">
          <div className="relative w-40 h-40 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke={dark ? '#1e293b' : '#e2e8f0'} strokeWidth="10" fill="none" />
              <circle cx="50" cy="50" r="45" stroke="url(#grad)" strokeWidth="10" fill="none"
                strokeDasharray={`${2 * Math.PI * 45 * pct / 100} ${2 * Math.PI * 45 * (1 - pct / 100)}`}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white drop-shadow-sm">{todaySteps.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/ {GOAL.toLocaleString()}</span>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-black text-emerald-500">{pct}%</span>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Today's Progress</h3>
          <p className="text-sm font-medium text-slate-500">{Math.max(0, GOAL - todaySteps).toLocaleString()} steps left to reach your goal</p>
          {pct >= 100 && <div className="mt-4 badge bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 animate-bounce shadow-lg shadow-emerald-500/20">🎉 Daily Goal Met!</div>}
        </div>

        {/* Log Form */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-sm">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
               <Plus size={16} />
            </div>
            Update Step Count
          </h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Activity Date</label>
              <input type="date" value={form.step_date} onChange={e => setForm(f => ({ ...f, step_date: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">Number of Steps</label>
              <div className="relative">
                <Footprints size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" value={form.step_count} onChange={e => setForm(f => ({ ...f, step_count: e.target.value }))}
                  className="input pl-10" placeholder="e.g. 8500" required min={1} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
              {loading ? 'Syncing...' : 'Sync Steps'}
            </button>
          </form>

          {/* Quick presets */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {[3000, 5000, 8000, 10000, 12000].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, step_count: n }))}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary shadow-sm active:scale-95">
                  {n.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="card">
        <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Footprints size={18} className="text-emerald-500" /> Activity Trend
        </h3>
        <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-widest pl-7">Past 7 Days</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#1e293b' : '#f1f5f9'} />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontWeight:600 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight:600 }} axisLine={false} tickLine={false} dx={-5} />
            <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ fill: dark ? '#1e293b' : '#f8fafc' }} />
            <ReferenceLine y={GOAL} stroke="#10b981" strokeDasharray="6 6" label={{ value:'🎯 GOAL', fill:'#10b981', fontSize:10, fontWeight:900, position:'right' }} />
            <Bar dataKey="steps" fill="url(#stepGrad)" radius={[6,6,2,2]} barSize={28} />
            <defs>
              <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* History */}
      <div className="card p-0 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">History Logs</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">Last 30 Logs</span>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-[400px] overflow-y-auto no-scrollbar">
          {steps.length === 0 ? <div className="text-center py-16 text-slate-400 font-medium italic">No logs found yet</div> :
            steps.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center border border-emerald-500/10 group-hover:scale-110 transition-transform">
                    <Footprints size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{(s.step_count||0).toLocaleString()} steps</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mt-0.5">{s.step_date?.split('T')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-xl border tracking-widest uppercase ${s.step_count >= GOAL ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {s.step_count >= GOAL ? 'Goal Met' : `${Math.round(s.step_count / GOAL * 100)}%`}
                  </span>
                  <button onClick={() => remove(s.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
