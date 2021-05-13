import { TMTransition } from './turing-machine-config.interface';

export interface TMStep {
  trans: TMTransition;
  state: number;
  bandContents: TMStepBandSymbol[][];
}
export interface TMStepBandSymbol {
  symbol: string;
  isCurrentPosition: boolean;
}
