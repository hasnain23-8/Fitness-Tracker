const ICONS = {
  trophy:     '🏆',
  dumbbell:   '💪',
  footprints: '👣',
  target:     '🎯',
  fire:       '🔥',
  star:       '⭐',
  medal:      '🥇',
  zap:        '⚡',
};

export default function BadgeCard({ title, description, badge_icon = 'trophy', earned_at }) {
  const icon = ICONS[badge_icon] || '🏅';
  return (
    <div className="card-glow flex items-center gap-4 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-2xl flex-shrink-0 animate-pulse-glow">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight">{title}</h4>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{description}</p>
        {earned_at && (
          <p className="text-[10px] font-black text-amber-600 dark:text-amber-500/60 mt-1 uppercase tracking-widest">
            {new Date(earned_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
