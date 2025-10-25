export const fmt = {
  date: (iso: string) => new Date(iso).toLocaleString(),
  pct: (x: number) => `${(x * 100).toFixed(1)}%`,
};
