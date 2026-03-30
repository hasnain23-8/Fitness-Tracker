export default function ProgressBar({ value = 0, max = 100, color = '#6366f1', label, showPercent = true }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const gradient = {
    '#6366f1': 'from-primary to-accent',
    '#10b981': 'from-emerald-500 to-teal-400',
    '#f59e0b': 'from-amber-500 to-orange-400',
    '#ef4444': 'from-red-500 to-pink-400',
    '#06b6d4': 'from-cyan-500 to-sky-400',
  }[color] || 'from-primary to-accent';

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>}
          {showPercent && <span className="text-xs font-black text-slate-900 dark:text-slate-300">{pct}%</span>}
        </div>
      )}
      <div className="progress-bar">
        <div
          className={`progress-fill bg-gradient-to-r ${gradient}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
