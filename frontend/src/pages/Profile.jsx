import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, socialAPI, uploadAPI } from '../services/api';
import BadgeCard from '../components/BadgeCard';
import { User, Camera, Save, Image, Trash2, Trophy } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { dark } = useTheme();
  const [form,         setForm]         = useState({ name:'', date_of_birth:'', gender:'', height_cm:'', weight_kg:'' });
  const [achievements, setAchievements] = useState([]);
  const [photos,       setPhotos]       = useState([]);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [avatar,       setAvatar]       = useState(null);
  const profileRef  = useRef();
  const progressRef = useRef();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [me, ach, ph] = await Promise.all([authAPI.getMe(), socialAPI.getAchievements(), uploadAPI.getPhotos()]);
      const d = me.data;
      setForm({ name: d.name||'', date_of_birth: d.date_of_birth?.split('T')[0]||'', gender: d.gender||'', height_cm: d.height_cm||'', weight_kg: d.weight_kg||'' });
      setAchievements(ach.data);
      setPhotos(ph.data);
      if (d.profile_picture) setAvatar(API_BASE + d.profile_picture);
    } catch {}
  };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await authAPI.updateProfile(form);
      updateUser({ name: form.name });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {} finally { setSaving(false); }
  };

  const uploadAvatar = async e => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('image', file);
    const { data } = await uploadAPI.profilePic(fd);
    setAvatar(API_BASE + data.url);
    updateUser({ profile_picture: data.url });
  };

  const uploadProgress = async e => {
    const file = e.target.files[0]; if (!file) return;
    const caption = prompt('Caption (optional):') || '';
    const fd = new FormData(); fd.append('image', file); fd.append('caption', caption);
    await uploadAPI.progressPhoto(fd); loadAll();
  };

  const deletePhoto = async id => { if (!confirm('Delete photo?')) return; await uploadAPI.deletePhoto(id); loadAll(); };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="page-title !text-slate-900 dark:!text-white">Profile</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your account & progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar + Info */}
        <div className="card flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border-2 border-primary/30 overflow-hidden flex items-center justify-center p-1 backdrop-blur-sm">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-primary uppercase">{user?.name?.charAt(0)}</span>
                )}
              </div>
            </div>
            <button onClick={() => profileRef.current?.click()}
              className="absolute bottom-1 right-1 w-9 h-9 bg-primary border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center hover:bg-primary-dark transition-all shadow-xl hover:scale-110 active:scale-95">
              <Camera size={14} className="text-white" />
            </button>
            <input ref={profileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{user?.name}</h3>
          <p className="text-sm font-semibold text-slate-500 truncate max-w-full">{user?.email}</p>
          <div className="mt-6 w-full pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xl font-black text-primary">{achievements.length}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Badges</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xl font-black text-primary">{photos.length}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Photos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <User size={16} />
            </div>
            Account Settings
          </h3>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className="input" placeholder="Your name" />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={e => setForm(f=>({...f,date_of_birth:e.target.value}))} className="input" />
              </div>
              <div>
                <label className="label">Gender</label>
                <select value={form.gender} onChange={e => setForm(f=>({...f,gender:e.target.value}))} className="select">
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" value={form.height_cm} onChange={e => setForm(f=>({...f,height_cm:e.target.value}))} className="input" placeholder="175" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm(f=>({...f,weight_kg:e.target.value}))} className="input" placeholder="70" />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   saved ? <span>✓</span> : <Save size={16} />
                )}
                {saved ? 'Settings Saved' : (saving ? 'Saving...' : 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-3">
          <Trophy size={20} className="text-amber-500" /> 
          Achievements 
          <span className="text-sm font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
            {achievements.length}
          </span>
        </h3>
        {achievements.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Trophy size={40} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No badges earned yet. Start logging sessions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map(a => <BadgeCard key={a.id} {...a} />)}
          </div>
        )}
      </div>

      {/* Progress Photos */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
              <Image size={18} />
            </div>
            Progress Photos
          </h3>
          <button onClick={() => progressRef.current?.click()} className="btn-secondary text-sm flex items-center gap-2 py-2 px-4 shadow-sm hover:scale-105 active:scale-95 transition-all">
            <Camera size={14} /> Upload New
          </button>
          <input ref={progressRef} type="file" accept="image/*" className="hidden" onChange={uploadProgress} />
        </div>
        {photos.length === 0 ? (
          <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl py-12 text-center bg-slate-50/50 dark:bg-transparent transition-colors">
            <Camera size={36} className="mx-auto mb-4 text-slate-300 dark:text-slate-800" />
            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-[240px] mx-auto leading-relaxed">Post your transformation photos and track your progress visually.</p>
            <button onClick={() => progressRef.current?.click()} className="mt-4 text-xs font-bold text-primary hover:underline">Click to upload your first photo</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(p => (
              <div key={p.id} className="relative group rounded-2xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm">
                <img src={API_BASE + p.photo_url} alt={p.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
                  {p.caption && <p className="text-xs font-bold text-white text-center mb-4 line-clamp-3 leading-relaxed">{p.caption}</p>}
                  <button onClick={() => deletePhoto(p.id)} className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-90">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
