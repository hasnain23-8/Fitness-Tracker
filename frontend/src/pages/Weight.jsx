import { useState, useEffect } from 'react';
import { weightAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { getLocalDate } from '../utils/dateUtils';
import { Scale, Plus, Trash2, Pencil, X, History, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`${dark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'} border rounded-xl px-4 py-3 shadow-xl text-xs`}>
      <p className="mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value} kg</p>
      ))}
    </div>
  );
};

export default function Weight() {
  const { dark } = useTheme();
  const [logs,    setLogs]    = useState([]);
  const [modal,   setModal]   = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState({ weight_kg: '', log_date: getLocalDate(), note: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => { const { data } = await weightAPI.getAll(); setLogs(data); };

  const openAdd  = () => { setForm({ weight_kg: '', log_date: getLocalDate(), note: '' }); setEditId(null); setModal(true); };
  const openEdit = l => { setForm({ weight_kg: l.weight_kg, log_date: l.log_date?.split('T')[0], note: l.note || '' }); setEditId(l.id); setModal(true); };
  const close    = () => { setModal(false); setEditId(null); };

  const save = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (editId) await weightAPI.update(editId, form);
      else        await weightAPI.add(form);
      await load(); close();
    } catch {} finally { setLoading(false); }
  };

  const remove = async id => { if (!confirm('Delete weight entry?')) return; await weightAPI.remove(id); load(); };

  const chartData = [...logs].reverse().map(l => ({ date: l.log_date?.split('T')[0]?.slice(5), weight: parseFloat(l.weight_kg) }));
  const latest  = logs[0]?.weight_kg;
  const oldest  = logs[logs.length - 1]?.weight_kg;
  const change  = latest && oldest ? (latest - oldest).toFixed(1) : null;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title !text-slate-900 dark:!text-white">Weight Tracker</h1>
          <p className="text-slate-500 text-sm font-medium">Monitor your fitness transformation</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all">
          <Plus size={18} /> Log Weight
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center flex flex-col items-center justify-center py-6 hover:shadow-xl transition-shadow border-slate-100 dark:border-slate-800">
          <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{latest ? `${latest} kg` : '—'}</p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Current Entry</p>
        </div>
        <div className="card text-center flex flex-col items-center justify-center py-6 hover:shadow-xl transition-shadow border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
             {change !== null && parseFloat(change) < 0 ? <TrendingDown size={18} className="text-emerald-500" /> : change !== null && <TrendingUp size={18} className="text-orange-500" />}
             <p className={`text-2xl font-black ${change === null ? 'text-slate-400' : parseFloat(change) < 0 ? 'text-emerald-500' : 'text-orange-500'} uppercase tracking-tight`}>
               {change !== null ? `${change > 0 ? '+' : ''}${change} kg` : '—'}
             </p>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Net Variation</p>
        </div>
        <div className="card text-center flex flex-col items-center justify-center py-6 hover:shadow-xl transition-shadow border-slate-100 dark:border-slate-800">
          <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{logs.length}</p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Total Logs</p>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="card shadow-lg">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-3">
            <Scale size={18} className="text-primary-light" /> Timeline Progress
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:11, fontWeight:600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill:'#64748b', fontSize:11, fontWeight:600 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} dx={-5} />
              <Tooltip content={<CustomTooltip dark={dark} />} />
              <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} dot={{ fill:'#6366f1', r:5, strokeWidth:2, stroke: dark ? '#0f172a' : '#fff' }} name="Body Weight" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card p-0 overflow-hidden shadow-sm border-slate-100 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <History size={15} className="text-primary-light" /> Historical Data
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">All Entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Measurement</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Comment</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-20 text-slate-400 font-bold italic">No data yet. Log your weight to see progress.</td></tr>
              ) : logs.map((l, i) => (
                <tr key={l.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200">
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{l.log_date?.split('T')[0]}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{l.weight_kg} kg</span>
                      {i > 0 && (
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm flex-shrink-0 ${l.weight_kg < logs[i-1].weight_kg ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                          {l.weight_kg < logs[i-1].weight_kg ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                          {Math.abs(l.weight_kg - logs[i-1].weight_kg).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">{l.note || 'No comment provided.'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(l)} className="p-2 text-slate-300 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Pencil size={14} /></button>
                      <button onClick={() => remove(l.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{editId ? 'Edit Performance' : 'Log New Entry'}</h3>
              <button onClick={close} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Captured Date</label>
                  <input type="date" value={form.log_date} onChange={e => setForm(f => ({ ...f, log_date: e.target.value }))} className="input shadow-sm" required />
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} className="input shadow-sm" placeholder="70.5" required min={1} />
                </div>
              </div>
              <div>
                <label className="label">Annotation (optional)</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="input shadow-sm" placeholder="After gym session, morning fast..." />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="btn-primary w-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? 'Logging...' : editId ? 'Store Update' : 'Commit Measurement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
