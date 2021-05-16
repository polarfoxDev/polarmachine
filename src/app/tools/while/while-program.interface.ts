export type WhileProgram = WhileInstruction[];

export interface WhileSetValueInstruction {
  discriminator: 'whileSetValueInstruction';
  setVariable: string;
  useVariable: string;
  useConstant: string;
}

export interface WhileWhileInstruction {
  discriminator: 'whileWhileInstruction';
  whileVariable: string;
  do: WhileProgram;
}
export interface WhileMacroWhileInstruction {
  discriminator: 'whileMacroWhileInstruction';
  whileVariable: string;
  do: WhileMacro;
}

export interface WhileDefineMacroInstruction {
  discriminator: 'whileDefineMacroInstruction';
  name: string;
  macroCode: WhileMacroInstruction[];
}

export type WhileInstruction =
  WhileSetValueInstruction | WhileWhileInstruction | WhileDefineMacroInstruction | WhileUseStaticMacroInstruction | WhileUseProgramMacroInstruction;

export interface WhileMacroRunProgramInstruction {
  discriminator: 'whileMacroRunProgramInstruction';
}

export type WhileMacroInstruction = WhileSetValueInstruction | WhileMacroWhileInstruction | WhileMacroRunProgramInstruction;

export interface WhileUseStaticMacroInstruction {
  discriminator: 'whileUseStaticMacroInstruction';
  name: string;
  bindVars: string[];
  constants: number[];
}

export interface WhileUseProgramMacroInstruction {
  discriminator: 'whileUseProgramMacroInstruction';
  name: string;
  bindVars: string[];
  constants: number[];
  program: WhileProgram;
}

export type WhileMacro = WhileMacroInstruction[];

export interface WhileExecutionStep {
  instruction: WhileInstruction | WhileMacroInstruction;
  vars: { [id: string]: number; };
  scope: string;
}

