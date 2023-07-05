import { TMTransition } from './turing-machine-config.interface';

export interface TMStep {
  trans: TMTransition | null;
  state: number | null;
  bandContents: TMStepBandSymbol[][];
}
export interface TMStepBandSymbol {
  symbol: string | null;
  isCurrentPosition: boolean;
}
