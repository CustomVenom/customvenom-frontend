'use client';

type WeekSelectorProps = {
  currentWeek: string;
  onWeekChange: (week: string) => void;
  availableWeeks?: string[];
};

// Generate weeks for current season (2025, weeks 1-18)
function generateWeeks(year: number = 2025): string[] {
  const weeks: string[] = [];
  for (let week = 1; week <= 18; week++) {
    weeks.push(`${year}-${week.toString().padStart(2, '0')}`);
  }
  return weeks;
}

export default function WeekSelector({
  currentWeek,
  onWeekChange,
  availableWeeks,
}: WeekSelectorProps) {
  const weeks = availableWeeks || generateWeeks();

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Week selection">
      <label htmlFor="week-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Week:
      </label>
      <select
        id="week-select"
        value={currentWeek}
        onChange={(e) => onWeekChange(e.target.value)}
        aria-label={`Selected week: ${currentWeek}`}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium cursor-pointer transition-all hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {weeks.map((week) => (
          <option key={week} value={week}>
            {week}
          </option>
        ))}
      </select>
    </div>
  );
}
