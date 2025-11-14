'use client';

interface Props {
  total: number;
}

export default function TeamTotal({ total }: Props) {
  return (
    <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
      <h2 className="text-2xl font-bold">Team Total</h2>
      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
        {total.toFixed(1)} pts
      </div>
    </div>
  );
}
