interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}

export default function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="card-static p-6 animate-slide-up bg-[#0d0d0c] border border-[var(--card-border)] relative overflow-hidden"
          style={{
            animationDelay: `${index * 0.08}s`,
            animationFillMode: "backwards",
          }}
        >
          {/* Subtle Accent Glow Line at top */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20" />
          
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">
              {stat.label}
            </p>
            <div
              className={`w-8 h-8 border border-[var(--card-border)] flex items-center justify-center text-[var(--accent)] bg-black/40`}
            >
              {stat.icon}
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-[var(--foreground)] tracking-tight font-mono">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
