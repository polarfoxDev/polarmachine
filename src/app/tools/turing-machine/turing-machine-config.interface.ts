export interface TuringMachineConfig {
  bands: TMBand[];
  alphabet: string;
  transitions: TMTransition[];
  state?: number;
  finiteStates?: number[];
}
export interface TMBand {
  contentPositiveIndex: string[];
  contentNegativeIndex?: string[];
  position?: number;
  isOutputBand?: boolean;
  nonNegative?: boolean;
}
export interface TMTransition {
  inState: number;
  read: string[];
  toState: number;
  write: string[];
  move: TMMoveDirection[];
}
export type TMMoveDirection = 'left' | 'right' | 'not';
