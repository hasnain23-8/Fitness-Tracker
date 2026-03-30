import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { workoutAPI, stepsAPI, goalsAPI, leaderboardAPI } from '../services/api';
import { getLocalDate, formatToLocalDate } from '../utils/dateUtils';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { Dumbbell, Footprints, Flame, Target, Trophy, Clock } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

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

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [weeklyWorkouts, setWeeklyWorkouts] = useState([]);
  const [weeklySteps,    setWeeklySteps]    = useState([]);
  const [allSteps,       setAllSteps]       = useState([]);
  const [goals,          setGoals]          = useState([]);
  const [leaderboard,    setLeaderboard]    = useState([]);
  const [totalSteps,     setTotalSteps]     = useState(0);
  const [todaySteps,     setTodaySteps]     = useState(0);
  const [totalCals,      setTotalCals]      = useState(0);
  const [workoutCount,   setWorkoutCount]   = useState(0);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    loadAll();
  }, [period]);

  const loadAll = async () => {
    try {
      const fn = period === 'weekly' ? workoutAPI.weeklyStats : workoutAPI.monthlyStats;
      const [wRes, sRes, gRes, lRes, allSRes] = await Promise.all([
        fn(), 
        stepsAPI.weekly(), 
        goalsAPI.getAll(), 
        leaderboardAPI.get('steps', 'week'),
        stepsAPI.getAll()
      ]);
      
      setWeeklyWorkouts(wRes.data.map(d => ({ date: d.date?.split('T')[0]?.slice(5), calories: d.total_calories, workouts: d.workout_count, duration: d.total_duration })));
      setWeeklySteps(sRes.data.map(d => ({ date: d.date?.split('T')[0]?.slice(5), steps: d.step_count })));
      setAllSteps(allSRes.data);
      setGoals(gRes.data.slice(0, 4));
      setLeaderboard(lRes.data.slice(0, 5));
      setTotalCals(wRes.data.reduce((a, d) => a + (d.total_calories || 0), 0));
      setWorkoutCount(wRes.data.reduce((a, d) => a + (d.workout_count || 0), 0));
      setTotalSteps(sRes.data.reduce((a, d) => a + (d.step_count || 0), 0));

      // Calculate Today's Steps correctly using local date
      const today = getLocalDate();
      const todayEntry = allSRes.data.find(s => formatToLocalDate(s.step_date) === today);
      setTodaySteps(todayEntry ? todayEntry.step_count : 0);
      
    } catch {}
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title !text-slate-900 dark:!text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
          {['weekly', 'monthly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${period === p ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm border border-slate-200 dark:border-primary/50' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Footprints} label="Today's Steps" value={todaySteps.toLocaleString()} color="emerald" sub="Current day" />
        <StatCard icon={Flame}      label="Total Kcal"    value={totalCals.toLocaleString()}  color="orange" sub={`${period} total`} />
        <StatCard icon={Dumbbell}   label="Sessions"      value={workoutCount}                color="primary" sub={`${period} workout count`} />
        <StatCard icon={Clock}      label="Activity Time" value={weeklyWorkouts.reduce((a,d)=>a+(d.duration||0), 0) + ' min'} color="sky" sub={`${period} total`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Calories & Workouts Chart */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
            <Flame size={18} className="text-orange-500" /> Performance Analysis
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyWorkouts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontWeight:600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight:600 }} axisLine={false} tickLine={false} dx={-5} />
              <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ fill: dark ? '#1e293b' : '#f8fafc' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="calories" name="Calories" fill="#f97316" radius={[4,4,0,0]} barSize={24} />
              <Bar dataKey="workouts" name="Workouts" fill="#6366f1" radius={[4,4,0,0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Steps Chart */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
            <Footprints size={18} className="text-emerald-500" /> Movement Trend
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklySteps}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontWeight:600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight:600 }} axisLine={false} tickLine={false} dx={-5} />
              <Tooltip content={<CustomTooltip dark={dark} />} />
              <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5, strokeWidth: 3, stroke: dark ? '#0f172a' : '#fff' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals + Leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Goals Progress */}
        <div className="card h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
              <Target size={18} className="text-primary" /> Active Goal Progress
            </h3>
            <a href="/goals" className="text-xs font-bold text-primary hover:underline">View All</a>
          </div>
          {goals.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
              <Target size={40} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
              <p className="text-sm font-bold text-slate-400">No active goals found.</p>
              <a href="/goals" className="mt-2 inline-block text-xs font-black text-primary hover:underline">Start a new goal →</a>
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map(goal => (
                <div key={goal.id} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{goal.title}</span>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                      {goal.current_value}/{goal.target_value} {goal.unit}
                    </span>
                  </div>
                  <ProgressBar value={goal.current_value} max={goal.target_value} color={goal.category === 'steps' ? '#10b981' : '#6366f1'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mini Leaderboard */}
        <div className="card h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" /> Top Ranked Friends
            </h3>
            <a href="/friends" className="text-xs font-bold text-primary hover:underline">Full Board</a>
          </div>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
              <Trophy size={40} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
              <p className="text-sm font-bold text-slate-400 tracking-tight">Leaderboard currently empty.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((u, i) => (
                <div key={u.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-amber-500/20 text-amber-500' : i === 1 ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : i === 2 ? 'bg-orange-700/20 text-orange-600' : 'text-slate-400'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-black text-primary border border-primary/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {u.name?.charAt(0)}
                  </div>
                  <span className="flex-1 text-sm font-bold text-slate-700 dark:text-slate-100 truncate">{u.name}</span>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-500">{(u.total_steps || 0).toLocaleString()}</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">steps</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
