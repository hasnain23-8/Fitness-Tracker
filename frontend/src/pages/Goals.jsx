import { useState, useEffect } from 'react';
import { goalsAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from '../components/ProgressBar';
import { Target, Plus, Pencil, Trash2, X, CheckCircle2, Trophy } from 'lucide-react';
import Confetti from 'react-confetti';

const CATS = ['steps','weight','workout','calories','custom'];
const CAT_COLORS = { steps:'#10b981', weight:'#6366f1', workout:'#f97316', calories:'#ef4444', custom:'#8b5cf6' };
const emptyForm = { title:'', category:'steps', target_value:'', current_value:'0', unit:'', deadline:'' };

export default function Goals() {
  const { dark } = useTheme();
  const [goals,   setGoals]   = useState([]);
  const [modal,   setModal]   = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [confetti,setConfetti]= useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => { const { data } = await goalsAPI.getAll(); setGoals(data); };

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = g => { setForm({ ...g, deadline: g.deadline?.split('T')[0] || '' }); setEditId(g.id); setModal(true); };
  const close    = () => { setModal(false); setEditId(null); };

  const save = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const pct = parseFloat(form.current_value) / parseFloat(form.target_value);
      const is_completed = pct >= 1 ? 1 : 0;
      const payload = { ...form, is_completed };
      if (editId) {
        await goalsAPI.update(editId, payload);
        if (is_completed && !goals.find(g => g.id === editId)?.is_completed) { setConfetti(true); setTimeout(() => setConfetti(false), 4000); }
      } else await goalsAPI.add(payload);
      await load(); close();
    } catch {} finally { setLoading(false); }
  };

  const markDone = async goal => {
    await goalsAPI.update(goal.id, { ...goal, current_value: goal.target_value, is_completed: 1 });
    setConfetti(true); setTimeout(() => setConfetti(false), 4000);
    load();
  };

  const remove = async id => { if (!confirm('Delete goal?')) return; await goalsAPI.remove(id); load(); };

  const active    = goals.filter(g => !g.is_completed);
  const completed = goals.filter(g => g.is_completed);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {confetti && <Confetti recycle={false} numberOfPieces={300} />}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title !text-slate-900 dark:!text-white">Goals</h1>
          <p className="text-slate-500 text-sm font-medium">{active.length} active · {completed.length} completed</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all">
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Active Goals */}
      {active.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2 dark:border-slate-800">
          <Target size={48} className="mx-auto mb-4 opacity-20 text-primary" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active goals</h3>
          <p className="text-slate-500 text-sm mb-6">Set a goal to start tracking your progress</p>
          <button onClick={openAdd} className="btn-primary">Create Your First Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.map(goal => {
            const pct = Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100);
            const color = CAT_COLORS[goal.category] || CAT_COLORS.custom;
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null;
            return (
              <div key={goal.id} className="card-glow animate-slide-up group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 capitalize mb-2 ring-1 ring-slate-200 dark:ring-transparent">
                      {goal.category}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{goal.title}</h4>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(goal)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => remove(goal.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </span>
                    <span className="text-sm font-extrabold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-1 ring-slate-200 dark:ring-transparent">
                    <div className="h-full rounded-full transition-all duration-700 shadow-sm"
                      style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${color}, ${color}aa)` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {daysLeft !== null && (
                    <span className={`text-xs font-bold ${daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                    </span>
                  )}
                  <button onClick={() => markDone(goal)} className="ml-auto text-xs font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all border border-emerald-500/20">
                    <CheckCircle2 size={14} /> Done
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completed.length > 0 && (
        <div className="pt-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Goal History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map(goal => (
              <div key={goal.id} className="card border-emerald-500/20 flex items-center gap-4 py-4 px-5 bg-emerald-50/20 dark:bg-emerald-500/5 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{goal.title}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{goal.category} · {goal.target_value} {goal.unit}</p>
                </div>
                <button onClick={() => remove(goal.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editId ? 'Edit Goal' : 'New Goal'}</h3>
              <button onClick={close} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="label">Goal Title</label>
                <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} className="input" placeholder="Run 100km this month" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} className="select">
                    {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))} className="input" placeholder="km, kg, reps…" />
                </div>
                <div>
                  <label className="label">Target Value</label>
                  <input type="number" step="0.1" value={form.target_value} onChange={e => setForm(f=>({...f,target_value:e.target.value}))} className="input" placeholder="100" required />
                </div>
                <div>
                  <label className="label">Current Value</label>
                  <input type="number" step="0.1" value={form.current_value} onChange={e => setForm(f=>({...f,current_value:e.target.value}))} className="input" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="label">Deadline (optional)</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} className="input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 shadow-md">{loading ? 'Saving…' : editId ? 'Update' : 'Create Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
