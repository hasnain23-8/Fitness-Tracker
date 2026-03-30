export default function StatCard({ icon: Icon, label, value, sub, color = 'primary', trend }) {
  const colors = {
    primary: { bg: 'bg-primary/10', text: 'text-primary-light', border: 'border-primary/20' },
    green:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    orange:  { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    pink:    { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
    blue:    { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  };
  const c = colors[color] || colors.primary;

  return (
    <div className="card-glow animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${c.bg} ${c.border} border rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={c.text} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
