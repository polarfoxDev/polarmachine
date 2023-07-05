export interface TuringMachineConfig {
  bands: TMBand[];
  alphabet: string;
  transitions: TMTransition[];
  state: number | null;
  finalStates?: number[];
}
export interface TMBand {
  contentPositiveIndex: (string | null)[];
  contentNegativeIndex: (string | null)[];
  position: number;
  isOutputBand?: boolean;
  nonNegative?: boolean;
  recentValueChange?: boolean;
}
export interface TMTransition {
  inState: number | null;
  read: (string | null)[];
  toState: number | null;
  write: (string | null)[];
  move: TMMoveDirection[];
}
export type TMMoveDirection = 'left' | 'right' | 'not';
