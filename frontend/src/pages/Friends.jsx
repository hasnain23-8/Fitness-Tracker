import { useState, useEffect, useRef, useCallback } from 'react';
import { socialAPI, leaderboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Users, Search, UserPlus, Check, X, Trophy,
  Footprints, Flame, Dumbbell, Crown,
  ChevronUp, ChevronDown, Clock, Calendar, Infinity as InfinityIcon,
  UserCheck, Bell, UserMinus, RefreshCw, ArrowUpDown, Filter
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────── */
const SORT_OPTS = [
  { value: 'steps',    label: 'Steps',    icon: Footprints, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', barColor: 'from-emerald-500 to-teal-400',    glow: 'shadow-emerald-500/10' },
  { value: 'calories', label: 'Calories', icon: Flame,      color: 'text-orange-500 dark:text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',  barColor: 'from-orange-500 to-amber-400',    glow: 'shadow-orange-500/10'  },
  { value: 'workouts', label: 'Workouts', icon: Dumbbell,   color: 'text-violet-500 dark:text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/30',  barColor: 'from-violet-600 to-purple-400',   glow: 'shadow-violet-500/10'  },
];
const PERIOD_OPTS = [
  { value: 'week',  label: 'Week',     fullLabel: 'This Week',  icon: Clock      },
  { value: 'month', label: 'Month',    fullLabel: 'This Month', icon: Calendar   },
  { value: 'all',   label: 'All Time', fullLabel: 'All Time',   icon: InfinityIcon },
];
const SORT_KEY = { steps: 'total_steps', calories: 'total_calories', workouts: 'workout_count' };

const MEDALS = [
  { icon: '🥇', ringClass: 'ring-yellow-500/60',  bg: 'from-yellow-500/20 to-amber-500/10',  text: 'text-yellow-600 dark:text-yellow-400', label: '1st' },
  { icon: '🥈', ringClass: 'ring-slate-400/60',   bg: 'from-slate-400/20 to-slate-500/10',   text: 'text-slate-600 dark:text-slate-300',  label: '2nd' },
  { icon: '🥉', ringClass: 'ring-orange-500/60',  bg: 'from-orange-600/20 to-orange-700/10', text: 'text-orange-600 dark:text-orange-400', label: '3rd' },
];

/* ─── Utility: Avatar ───────────────────────────────────────── */
const GRADIENTS = [
  'from-violet-600/70 to-purple-500/50',
  'from-emerald-600/70 to-teal-500/50',
  'from-orange-600/70 to-amber-500/50',
  'from-sky-600/70 to-blue-500/50',
  'from-rose-600/70 to-pink-500/50',
];
const gradientFor = (name = '') => GRADIENTS[name.charCodeAt(0) % GRADIENTS.length] || GRADIENTS[0];

const Avatar = ({ name = '', size = 'md', rank }) => {
  const sizes = { xs: 'w-7 h-7 text-[10px]', sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-lg' };
  const medal = rank !== undefined ? MEDALS[rank] : null;
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradientFor(name)} flex items-center justify-center font-bold text-white
        ${medal ? `ring-2 ${medal.ringClass}` : 'ring-1 ring-white/20'} select-none`}>
        {name.charAt(0).toUpperCase() || '?'}
      </div>
      {medal && (
        <span className="absolute -bottom-1 -right-1 text-sm leading-none">{medal.icon}</span>
      )}
    </div>
  );
};

/* ─── Skeleton loader ───────────────────────────────────────── */
const Skeleton = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse ${className}`} />
);

/* ─── Tab Button ─────────────────────────────────────────────── */
const TabBtn = ({ active, onClick, icon: Icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
      ${active
        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 scale-[1.02]'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
  >
    <Icon size={15} />
    {label}
    {badge > 0 && (
      <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center bg-rose-500 ring-2 ring-white dark:ring-slate-900">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);

/* ═══════════════════════════════════════════════════════════════ */
export default function Friends() {
  const { user: currentUser } = useAuth();
  const { dark } = useTheme();

  const [tab, setTab]             = useState('friends');
  const [friends, setFriends]     = useState([]);
  const [pending, setPending]     = useState([]);
  const [board, setBoard]         = useState([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* search */
  const [search, setSearch]       = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);

  /* leaderboard */
  const [sort, setSort]           = useState('steps');
  const [period, setPeriod]       = useState('week');
  const [boardSearch, setBoardSearch] = useState('');
  const [sortDir, setSortDir]     = useState('desc');

  /* action states */
  const [sentReqs, setSentReqs]   = useState(new Set());
  const [actionFId, setActionFId] = useState(null);

  const debounceRef = useRef(null);

  /* ── Load ───────────────────────────────────────────────────── */
  useEffect(() => { load(); }, []);
  useEffect(() => { loadBoard(); }, [sort, period]);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoadingMain(true);
    try {
      const [f, p] = await Promise.all([
        socialAPI.getFriends(),
        socialAPI.getPending(),
      ]);
      setFriends(f.data);
      setPending(p.data);
    } catch { /* silently fail */ }
    finally { setLoadingMain(false); setRefreshing(false); }
  };

  const loadBoard = async () => {
    setLoadingBoard(true);
    try {
      const { data } = await leaderboardAPI.combined(sort, period);
      setBoard(data);
    } catch { setBoard([]); }
    finally { setLoadingBoard(false); }
  };

  /* ── Debounced friend search ────────────────────────────────── */
  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await socialAPI.searchUsers(val);
        setResults(data);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
  }, []);

  /* ── Actions ────────────────────────────────────────────────── */
  const sendReq = async (id) => {
    try {
      await socialAPI.sendRequest({ friend_id: id });
      setSentReqs(s => new Set([...s, id]));
      setResults(prev => prev.map(u => u.id === id ? { ...u, friend_status: 'pending', request_direction: 'sent' } : u));
    } catch { /* handle conflict gracefully */ }
  };

  const accept = async (id) => {
    try { await socialAPI.respondRequest(id, { status: 'accepted' }); load(true); }
    catch { /* retry */ }
  };

  const reject = async (id) => {
    try { await socialAPI.respondRequest(id, { status: 'rejected' }); load(true); }
    catch { /* retry */ }
  };

  const removeFriend = async (friendId) => {
    if (!confirm('Remove this friend?')) return;
    setActionFId(friendId);
    try {
      await socialAPI.removeFriend(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch { /* retry */ }
    finally { setActionFId(null); }
  };

  /* ── Filtered & sorted leaderboard ─────────────────────────── */
  const filteredBoard = board
    .filter(u => !boardSearch.trim() || u.name?.toLowerCase().includes(boardSearch.toLowerCase()))
    .sort((a, b) => {
      const key = SORT_KEY[sort];
      return sortDir === 'desc' ? (b[key] || 0) - (a[key] || 0) : (a[key] || 0) - (b[key] || 0);
    });

  const sortObj = SORT_OPTS.find(o => o.value === sort);

  /* ── Friend search status helpers ──────────────────────────── */
  const getRelationshipBadge = (u) => {
    if (u.friend_status === 'accepted') {
      return { label: 'Friends', icon: UserCheck, cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    }
    if (u.friend_status === 'pending') {
      if (u.request_direction === 'sent') {
        return { label: 'Request Sent', icon: Check, cls: 'text-sky-500 bg-sky-500/10 border-sky-500/20' };
      }
      return { label: 'Accept', icon: UserPlus, cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20', action: () => accept(u.id) };
    }
    return null;
  };

  /* ── Podium top 3 ───────────────────────────────────────────── */
  const podiumData = filteredBoard.slice(0, 3);
  const podiumOrder = [1, 0, 2];

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title !text-slate-900 dark:!text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Trophy size={20} className="text-white" />
            </span>
            Friends & Leaderboard
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-1 font-medium">Compete and connect with your friends</p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3">
          {[
            { val: friends.length, label: 'Friends', icon: Users, color: 'text-violet-500 dark:text-violet-400' },
            { val: pending.length, label: 'Pending', icon: Bell,  color: 'text-amber-500 dark:text-amber-400'  },
          ].map(({ val, label, icon: Icon, color }) => (
            <div key={label} className="card py-2.5 px-4 text-center min-w-[72px] flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Icon size={13} className={color} />
                <p className={`text-xl font-black ${color}`}>{val}</p>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
        <TabBtn active={tab === 'friends'}     onClick={() => setTab('friends')}     icon={Users}   label="Friends"     badge={pending.length} />
        <TabBtn active={tab === 'leaderboard'} onClick={() => setTab('leaderboard')} icon={Trophy}  label="Leaderboard" />
      </div>

      {/* FRIENDS TAB */}
      {tab === 'friends' && (
        <div className="space-y-6 animate-fade-in">
          {/* Pending requests banner */}
          {pending.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 p-5">
              <h3 className="font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Bell size={14} className="animate-pulse" />
                </div>
                {pending.length} Friend Request{pending.length > 1 ? 's' : ''} Received
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pending.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <Avatar name={p.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.email}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => accept(p.id)} className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-md active:scale-90"><Check size={14} /></button>
                      <button onClick={() => reject(p.id)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-500 hover:text-white rounded-lg transition-all active:scale-90"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search + Results */}
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Search size={18} className="text-primary" /> Find People
            </h3>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input value={search} onChange={handleSearch} className="input pl-12 pr-12" placeholder="Search athletes by name or email…" autoComplete="off" />
              {searching ? (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : search && (
                <button onClick={() => { setSearch(''); setResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all">
                {results.map(u => {
                  const rel = getRelationshipBadge(u);
                  const isSent = sentReqs.has(u.id) || (rel?.label === 'Request Sent');
                  return (
                    <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all shadow-sm">
                      <Avatar name={u.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                      </div>
                      {rel?.action ? (
                        <button onClick={rel.action} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all hover:scale-105 active:scale-95 ${rel.cls}`}>
                          {rel.label}
                        </button>
                      ) : rel ? (
                        <span className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border ${rel.cls}`}>{rel.label}</span>
                      ) : isSent ? (
                        <span className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">Sent</span>
                      ) : (
                        <button onClick={() => sendReq(u.id)} className="btn-primary px-4 py-2 text-xs shadow-md hover:scale-105 active:scale-95 transition-all">Add</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Friends */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck size={18} className="text-emerald-500" />
                Athlete Connections
                <span className="ml-1 text-xs font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                  {friends.length}
                </span>
              </h3>
              <button onClick={() => load(true)} disabled={refreshing} className="p-2 text-slate-400 hover:text-primary dark:hover:text-white transition-all bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            {loadingMain ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />)}
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <Users size={40} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
                <p className="text-sm font-bold text-slate-400 tracking-tight">Expand your circle!</p>
                <p className="text-xs text-slate-400 mt-1">Search for friends to connect and compete.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map(f => (
                  <div key={f.id} className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                    <Avatar name={f.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{f.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{f.email}</p>
                    </div>
                    <button onClick={() => removeFriend(f.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><UserMinus size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {tab === 'leaderboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTS.map(o => {
                const Icon = o.icon;
                const active = sort === o.value;
                return (
                  <button key={o.value} onClick={() => { setSort(o.value); setSortDir('desc'); }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black border transition-all duration-300 ${active
                      ? `${o.bg} ${o.color} shadow-lg ${o.glow} ring-2 ring-current ring-opacity-10`
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600'}`}>
                    <Icon size={14} />
                    <span className="uppercase tracking-widest">{o.label}</span>
                    {active && <span className="ml-1 opacity-60" onClick={e => { e.stopPropagation(); setSortDir(d => d === 'desc' ? 'asc' : 'desc'); }}>{sortDir === 'desc' ? '↓' : '↑'}</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-inner">
              {PERIOD_OPTS.map(o => (
                <button key={o.value} onClick={() => setPeriod(o.value)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${period === o.value
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}>{o.label}</button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={boardSearch} onChange={e => setBoardSearch(e.target.value)} className="input pl-12" placeholder="Search athletes on board..." />
          </div>

          {/* Podium */}
          {!loadingBoard && filteredBoard.length >= 3 && !boardSearch && (
            <div className="card p-6 overflow-hidden relative border-amber-500/10 bg-gradient-to-b from-amber-500/5 to-transparent">
              <p className="text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center justify-center gap-2">
                <Crown size={12} className="text-amber-500" /> Top Performers
              </p>
              <div className="flex items-end justify-center gap-3 sm:gap-8 min-h-[160px]">
                {podiumOrder.map(idx => {
                  const u = podiumData[idx]; if (!u) return null;
                  const medal = MEDALS[idx];
                  const val = u[SORT_KEY[sort]] || 0;
                  const isMe = currentUser && u.id === currentUser.id;
                  const heights = ['h-24', 'h-36', 'h-16'];
                  return (
                    <div key={u.id} className="flex flex-col items-center gap-3 flex-1 max-w-[140px] animate-slide-up" style={{ animationDelay:`${idx*100}ms` }}>
                      <div className="relative">
                        <div className={`p-1 rounded-full ring-2 ${medal.ringClass}`}>
                          <Avatar name={u.name} size="lg" />
                        </div>
                        {isMe && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full shadow-lg ring-2 ring-white dark:ring-slate-900 whitespace-nowrap">YOU</span>}
                      </div>
                      <div className="text-center min-w-0 w-full">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{u.name}</p>
                        <p className={`text-base font-black ${sortObj?.color}`}>{val.toLocaleString()}</p>
                      </div>
                      <div className={`w-full ${heights[idx]} rounded-t-3xl bg-gradient-to-t ${medal.bg} border-t-2 border-x-2 border-white dark:border-slate-800 flex items-center justify-center shadow-lg`}>
                        <span className="text-3xl drop-shadow-md">{medal.icon}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card p-0 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Trophy size={14} className="text-amber-500" /> Full Rankings
              </h4>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><ArrowUpDown size={10} /> {sortDir === 'desc' ? 'High → Low' : 'Low → High'}</span>
                {loadingBoard && <RefreshCw size={10} className="animate-spin text-primary" />}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/30 dark:bg-transparent border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Rank</th>
                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Athlete</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Steps</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Kcal</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {!loadingBoard && filteredBoard.map((u, i) => {
                    const isMe = currentUser && u.id === currentUser.id;
                    const medal = i < 3 ? MEDALS[i] : null;
                    return (
                      <tr key={u.id} className={`group transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${medal ? 'bg-transparent text-2xl' : 'text-slate-400 dark:text-slate-500 text-sm'}`}>
                            {medal ? medal.icon : i+1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Avatar name={u.name} size="sm" />
                            <div>
                              <p className={`text-sm font-black ${isMe ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{u.name}</p>
                              <div className="h-1 w-24 bg-slate-100 dark:bg-slate-700/50 rounded-full mt-1.5 overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${sortObj?.barColor}`} style={{ width:`${Math.min(100, (u[SORT_KEY[sort]]/board[0][SORT_KEY[sort]]*100))}%` }} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className={`text-sm font-black ${sort === 'steps' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>{(u.total_steps||0).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className={`text-sm font-black ${sort === 'calories' ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>{(u.total_calories||0).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className={`text-sm font-black ${sort === 'workouts' ? 'text-violet-500' : 'text-slate-400 dark:text-slate-500'}`}>{u.workout_count||0}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!loadingBoard && filteredBoard.length === 0 && (
                <div className="py-20 text-center">
                  <Trophy size={48} className="mx-auto mb-4 text-slate-100 dark:text-slate-800" />
                  <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">No rankings found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
