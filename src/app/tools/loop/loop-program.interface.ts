export type LoopProgram = LoopInstruction[];

export interface LoopSetValueInstruction {
  discriminator: 'loopSetValueInstruction';
  setVariable: string;
  useVariable: string;
  useConstant: string;
}

export interface LoopLoopInstruction {
  discriminator: 'loopLoopInstruction';
  loopVariable: string;
  do: LoopProgram;
}
export interface LoopMacroLoopInstruction {
  discriminator: 'loopMacroLoopInstruction';
  loopVariable: string;
  do: LoopMacro;
}

export interface LoopDefineMacroInstruction {
  discriminator: 'loopDefineMacroInstruction';
  name: string;
  macroCode: LoopMacroInstruction[];
}

export type LoopInstruction =
  LoopSetValueInstruction | LoopLoopInstruction | LoopDefineMacroInstruction | LoopUseStaticMacroInstruction | LoopUseProgramMacroInstruction;

export interface LoopMacroRunProgramInstruction {
  discriminator: 'loopMacroRunProgramInstruction';
}

export type LoopMacroInstruction = LoopSetValueInstruction | LoopMacroLoopInstruction | LoopMacroRunProgramInstruction;

export interface LoopUseStaticMacroInstruction {
  discriminator: 'loopUseStaticMacroInstruction';
  name: string;
  bindVars: string[];
  constants: number[];
}

export interface LoopUseProgramMacroInstruction {
  discriminator: 'loopUseProgramMacroInstruction';
  name: string;
  bindVars: string[];
  constants: number[];
  program: LoopProgram;
}

export type LoopMacro = LoopMacroInstruction[];

export interface LoopExecutionStep {
  instruction: LoopInstruction | LoopMacroInstruction;
  vars: { [id: string]: number; };
  scope: string;
}

