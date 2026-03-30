import { useState, useEffect } from 'react';
import { workoutAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { getLocalDate } from '../utils/dateUtils';
import { Plus, Pencil, Trash2, X, Dumbbell, Filter, Clock, Flame } from 'lucide-react';

const TYPES = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Walking', 'Swimming', 'Cycling', 'Other'];

export default function WorkoutLog() {
  const { dark } = useTheme();
  const [workouts, setWorkouts] = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState({ title: '', type: 'Cardio', duration_mins: '', calories_burned: '', notes: '', workout_date: getLocalDate() });
  const [loading,  setLoading]  = useState(false);
  const [filter,   setFilter]   = useState('All');

  useEffect(() => { load(); }, []);
  const load = async () => { const { data } = await workoutAPI.getAll(); setWorkouts(data); };

  const openAdd  = () => { setForm({ title: '', type: 'Cardio', duration_mins: '', calories_burned: '', notes: '', workout_date: getLocalDate() }); setEditId(null); setModal(true); };
  const openEdit = w => { setForm({ ...w, workout_date: w.workout_date?.split('T')[0] }); setEditId(w.id); setModal(true); };
  const close    = () => { setModal(false); setEditId(null); };

  const save = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (editId) await workoutAPI.update(editId, form);
      else        await workoutAPI.add(form);
      await load(); close();
    } catch {} finally { setLoading(false); }
  };

  const remove = async id => { if (!confirm('Delete workout?')) return; await workoutAPI.remove(id); load(); };

  const filtered = filter === 'All' ? workouts : workouts.filter(w => w.type === filter);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title !text-slate-900 dark:!text-white">Workout Log</h1>
          <p className="text-slate-500 text-sm font-medium">Capture every sweat session</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all">
          <Plus size={18} /> Log Session
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <Filter size={14} className="text-slate-400 mr-2 flex-shrink-0" />
        {['All', ...TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === t 
              ? 'bg-primary text-white border-primary shadow-md' 
              : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Activity</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Intensity</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold italic tracking-wide">No workout sessions recorded yet.</td></tr>
              ) : filtered.map(w => (
                <tr key={w.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Dumbbell size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{w.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{w.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-black text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20 shadow-sm">
                      <Flame size={12} /> {w.calories_burned} <span className="text-[10px] font-bold opacity-80 ml-0.5 uppercase">Kcal</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-tight">
                      <Clock size={12} className="text-primary-light" /> {w.duration_mins} mins
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{w.workout_date?.split('T')[0]}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(w)} className="p-2 text-slate-300 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Pencil size={14} /></button>
                      <button onClick={() => remove(w.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={14} /></button>
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
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{editId ? 'Modify Session' : 'New Workout Log'}</h3>
              <button onClick={close} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="space-y-5">
              <div>
                <label className="label">Session Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Morning HIIT, Chest Day..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Activity Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="select">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={form.workout_date} onChange={e => setForm(f => ({ ...f, workout_date: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="label">Duration (mins)</label>
                  <input type="number" value={form.duration_mins} onChange={e => setForm(f => ({ ...f, duration_mins: e.target.value }))} className="input" placeholder="45" required />
                </div>
                <div>
                  <label className="label">Intensity (kcal)</label>
                  <input type="number" value={form.calories_burned} onChange={e => setForm(f => ({ ...f, calories_burned: e.target.value }))} className="input" placeholder="350" required />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="btn-primary w-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? 'Processing...' : editId ? 'Store Changes' : 'Commit Workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
