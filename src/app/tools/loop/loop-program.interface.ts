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
export interface LoopMacroLoopInstruction {
  loopVariable: string;
  do: LoopMacro;
}

export interface LoopDefineMacroInstruction {
  name: string;
  macroCode: LoopMacroInstruction[];
}

export type LoopInstruction =
  LoopSetValueInstruction | LoopLoopInstruction | LoopDefineMacroInstruction | LoopUseStaticMacroInstruction | LoopUseProgramMacroInstruction;

export interface LoopMacroRunProgramInstruction {}

export type LoopMacroInstruction = LoopSetValueInstruction | LoopMacroLoopInstruction | LoopMacroRunProgramInstruction;

export interface LoopUseStaticMacroInstruction {
  name: string;
  bindVars: string[];
  bindConsts: number[];
}

export interface LoopUseProgramMacroInstruction extends LoopUseStaticMacroInstruction {
  program: LoopProgram;
}

export type LoopMacro = LoopMacroInstruction[];

