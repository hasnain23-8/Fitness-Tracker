import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import { notifAPI } from '../services/api';
import {
  LayoutDashboard, Dumbbell, Footprints, Weight, Target,
  Users, User, Bell, Sun, Moon, LogOut, Menu, X, Zap
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workouts',  icon: Dumbbell,        label: 'Workouts'  },
  { to: '/steps',     icon: Footprints,      label: 'Steps'     },
  { to: '/weight',    icon: Weight,          label: 'Weight'    },
  { to: '/goals',     icon: Target,          label: 'Goals'     },
  { to: '/friends',   icon: Users,           label: 'Friends'   },
  { to: '/profile',   icon: User,            label: 'Profile'   },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notifAPI.getAll().then(r => setUnread(r.data.filter(n => !n.is_read).length)).catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  /* ── Shared class helpers ─────────────────────────────────── */
  const sidebarBase = dark
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-slate-200 shadow-lg';

  const dividerClass = dark ? 'border-slate-800' : 'border-slate-200';

  const userNameClass  = dark ? 'text-white'    : 'text-slate-900';
  const userEmailClass = dark ? 'text-slate-500' : 'text-slate-500';

  const iconBtnClass = dark
    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100';

  const mobileHeaderClass = dark
    ? 'bg-slate-900/95 border-slate-800'
    : 'bg-white/95 border-slate-200 shadow-sm';

  return (
    <>
      {/* ── Desktop Sidebar ────────────────────────────────────── */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-full w-64 border-r flex-col z-40 transition-colors duration-300 ${sidebarBase}`}>

        {/* Logo */}
        <div className={`p-6 border-b ${dividerClass}`}>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">FitTracker</span>
          </Link>
        </div>

        {/* User info */}
        <div className={`p-4 border-b ${dividerClass}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-sm font-bold text-primary-light border border-primary/30 flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${userNameClass}`}>{user?.name}</p>
              <p className={`text-xs truncate ${userEmailClass}`}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className={`p-4 border-t ${dividerClass} space-y-1`}>
          <button
            onClick={toggle}
            className={`sidebar-link w-full text-left transition-colors rounded-xl px-4 py-3 ${iconBtnClass}`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl px-4 py-3"
          >
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ─────────────────────────────────────── */}
      <header className={`mobile-header md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur border-b px-4 h-14 flex items-center justify-between transition-colors duration-300 ${mobileHeaderClass}`}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold gradient-text">FitTracker</span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className={`p-2 rounded-lg transition-colors ${iconBtnClass}`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className={`relative p-2 rounded-lg transition-colors ${iconBtnClass}`}>
            <Bell size={18} />
            {unread > 0 && <span className="notification-dot">{unread}</span>}
          </button>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className={`p-2 rounded-lg transition-colors ${iconBtnClass}`}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-14">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <nav className={`relative border-r w-64 h-full p-4 space-y-1 overflow-y-auto transition-colors duration-300 ${sidebarBase}`}>
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
              >
                <Icon size={18} /><span>{label}</span>
              </Link>
            ))}
            <hr className={`my-2 ${dividerClass}`} />
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-red-400 hover:text-red-500 hover:bg-red-500/10"
            >
              <LogOut size={18} /><span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
