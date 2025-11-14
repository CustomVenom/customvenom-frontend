export type Reason = {
  component: string;
  delta_points: number;
  confidence: number;
  unit?: 'points' | 'percent';
  hasDelta?: boolean; // Flag to indicate if delta was found/extracted
};
