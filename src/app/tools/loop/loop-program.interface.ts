export type LoopProgram = LoopInstruction[];

export interface LoopSetValueInstruction {
  setVariable: string;
  useVariable: string;
  useConstant: number;
}
export interface LoopLoopInstruction {
  loopVariable: string;
  do: LoopProgram;
}
export interface LoopMacro {
  name: string;
  syntax?: string;
  macroCode: LoopProgram;
  varList: (string|LoopProgram)[];
}
export type LoopInstruction = LoopSetValueInstruction | LoopLoopInstruction | LoopMacro;
