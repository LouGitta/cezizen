export interface BreathingExercise {
  id: number;
  name: string;
  inhale: number; // Duration in ms
  exhale: number; // Duration in ms
  hold: number;   // Duration in ms
  description?: string | null;
  is_active: boolean;
}
