interface StatisticsGridProps {
  stats: Record<string, number>;
  colors: Record<string, string>;
  gradients: Record<string, string>;
}

export const StatisticsGrid = ({ stats, colors, gradients }: StatisticsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
      {Object.entries(colors).filter(([status]) => status !== 'Missed').map(([status, color]) => (
        <div key={status} className={`${gradients[status]} rounded-xl p-4 border-2 transition-all duration-200 hover:scale-105 hover:shadow-md`}>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: color }} />
            <div>
              <p className="text-sm font-medium text-gray-700 capitalize">{status}</p>
              <p className="text-2xl font-bold" style={{ color }}>{stats[status] || 0}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
