import { Component } from '@angular/core';
import {
  WhileProgram,
  WhileDefineMacroInstruction,
  WhileExecutionStep,
  WhileMacro,
  WhileInstruction,
  WhileMacroInstruction,
  WhileSetValueInstruction,
  WhileWhileInstruction,
  WhileMacroWhileInstruction,
  WhileUseStaticMacroInstruction,
  WhileUseProgramMacroInstruction
} from './while-program.interface';

@Component({
  selector: 'app-while',
  templateUrl: './while.component.html',
  styleUrls: ['./while.component.scss']
})
export class WhileComponent {

  showingSyntax = true;
  codeInput = '';
  program: WhileProgram = [];
  macros: WhileDefineMacroInstruction[] = [];
  remainingLines: string[] = [];
  parseErrors: string[] = [];
  runtimeErrors: string[] = [];
  vars: { [id: string]: number; } = {};
  tempMacroVarNames: string[] = [];
  history: WhileExecutionStep[] = [];
  valueInputString = '';
  maxStepsInputString = '100';
  maxSteps: number = 0;
  readonly maxStepsLimit = 1000;
  stepCount = 0;

  constructor() { }

  ngOnInit(): void { }

  prepareAndRun(): void {
    this.parse();
    if (this.parseErrors.length > 0) {
      return;
    }
    this.vars = {};
    this.macros = [];
    this.runtimeErrors = [];
    this.tempMacroVarNames = [];
    this.history = [];
    this.stepCount = 0;
    this.valueInputString.split(',').forEach((x, i) => this.setVar('input' + i, Number(x.trim())));
    if (Object.values(this.vars).some(x => isNaN(x))) {
      this.parseErrors.push('Invalid input');
      return;
    }
    this.maxSteps = Number(this.maxStepsInputString);
    if (isNaN(this.maxSteps) || this.maxSteps < 1 || this.maxSteps > this.maxStepsLimit) {
      this.parseErrors.push('maximum # steps has to be between 1 and ' + this.maxStepsLimit);
      return;
    }
    this.setVar('output', 0);
    this.runSubRoutine(this.program);
    this.history = [... this.history, { instruction: null, vars: { ... this.vars }, scope: 'main' }];
  }

  runSubRoutine(program: WhileProgram): void {
    program.forEach(instruction => {
      this.stepCount++;
      if (this.stepCount > this.maxSteps) {
        this.runtimeErrors.push('Exceeded maximum number of steps');
        return;
      }
      this.history.push({ instruction, vars: { ... this.vars }, scope: 'main' });
      switch (instruction.discriminator) {
        case 'whileSetValueInstruction':
          this.setVar(instruction.setVariable, this.getVar(instruction.useVariable) + Number(instruction.useConstant));
          break;
        case 'whileWhileInstruction':
          while (this.getVar(instruction.whileVariable) > 0 && this.stepCount <= this.maxSteps) {
            this.runSubRoutine(instruction.do);
          }
          break;
        case 'whileDefineMacroInstruction':
          this.macros.push(instruction);
          break;
        case 'whileUseStaticMacroInstruction':
          const staticMacro = this.macros.find(x => x.name === instruction.name);
          if (!staticMacro) {
            this.runtimeErrors.push('macro not defined before usage: ' + instruction.name);
            break;
          }
          this.runMacro(
            this.macros.indexOf(staticMacro), staticMacro.macroCode, instruction.bindVars, instruction.constants
          );
          this.tempMacroVarNames.forEach(macroVarName => delete this.vars[macroVarName]);
          this.tempMacroVarNames = [];
          break;
        case 'whileUseProgramMacroInstruction':
          const programMacro = this.macros.find(x => x.name === instruction.name);
          if (!programMacro) {
            this.runtimeErrors.push('macro not defined before usage: ' + instruction.name);
            break;
          }
          this.runMacro(
            this.macros.indexOf(programMacro), programMacro.macroCode, instruction.bindVars, instruction.constants, instruction.program
          );
          this.tempMacroVarNames.forEach(macroVarName => delete this.vars[macroVarName]);
          this.tempMacroVarNames = [];
          break;
        default:
          break;
      }
    });
  }

  getMacroVarName(macroId: number, bindName: string, bindVars: string[]): string {
    const bindIndex = Number(bindName.substr(1));
    const varName = bindVars[bindIndex];
    if (varName === undefined) {
      const macroVarName = '@macro(' + macroId + ')::' + bindName.substr(1);
      this.tempMacroVarNames.push(macroVarName);
      return macroVarName;
    }
    return varName;
  }

  getMacroConstant(bindName: string, constants: number[], fallback: number = 0): number {
    let value: number;
    const sign = Number(bindName.substr(0, 1) + '1');
    if (!bindName.substr(1).startsWith('#')) {
      value = Number(bindName.substr(1));
    } else {
      const bindIndex = Number(bindName.substr(2));
      value = constants[bindIndex];
    }
    if (value === undefined || isNaN(value)) {
      return fallback;
    }
    return sign * value;
  }

  runMacro(macroId: number, macro: WhileMacro, bindVars: string[], constants: number[], callback?: WhileProgram): void {
    macro.forEach(instruction => {
      this.stepCount++;
      if (this.stepCount > this.maxSteps) {
        this.runtimeErrors.push('Exceeded maximum number of steps');
        return;
      }
      this.history.push({ instruction, vars: { ... this.vars }, scope: '@macro(' + macroId + ')' });
      switch (instruction.discriminator) {
        case 'whileSetValueInstruction':
          this.setVar(
            this.getMacroVarName(macroId, instruction.setVariable, bindVars),
            this.getVar(this.getMacroVarName(macroId, instruction.useVariable, bindVars))
            +
            this.getMacroConstant(instruction.useConstant, constants)
          );
          break;
        case 'whileMacroWhileInstruction':
          while (this.getVar(this.getMacroVarName(macroId, instruction.whileVariable, bindVars)) > 0 && this.stepCount <= this.maxSteps) {
            this.runMacro(macroId, instruction.do, bindVars, constants, callback);
          }
          break;
        case 'whileMacroRunProgramInstruction':
          if (!callback) {
            this.runtimeErrors.push('no subroutine provided for a macro using the PROGRAM instruction');
            break;
          }
          this.runSubRoutine(callback);
          break;
        default:
          break;
      }
    });
  }

  setVar(name: string, value: number): void {
    if (value < 0) { value = 0; }
    this.vars[name] = value;
  }

  getVar(name: string, fallback: number = 0): number {
    const value = this.vars[name];
    if (value === undefined) {
      return fallback;
    }
    return value;
  }

  parse(): void {
    this.parseErrors = [];
    this.remainingLines = this.codeInput.split(/[\n;]/).filter(line => line.length > 0);
    this.program = this.parseSubRoutine(true);
  }

  parseSubRoutine(isBaseLevel = false): WhileProgram {
    const subRoutine: WhileProgram = [];
    let nextInstruction: WhileInstruction | null;
    do {
      nextInstruction = this.parseInstruction(isBaseLevel);
      if (nextInstruction) {
        subRoutine.push(nextInstruction);
      }
    } while (nextInstruction);
    return subRoutine;
  }

  parseMacroRoutine(): WhileMacro {
    const subRoutine: WhileMacro = [];
    let nextInstruction: WhileMacroInstruction | null;
    do {
      nextInstruction = this.parseMacroInstruction();
      if (nextInstruction) {
        subRoutine.push(nextInstruction);
      }
    } while (nextInstruction);
    return subRoutine;
  }

  parseMacroInstruction(): WhileMacroInstruction | null {
    if (this.remainingLines.length === 0) {
      this.parseErrors.push('end of file inside macro');
      return null;
    }
    const nextLine = this.remainingLines.splice(0, 1)[0].trim();
    if (nextLine.match(/^WHILE (%[0-9]+) DO$/gi)) {
      return this.parseMacroWhile(nextLine);
    }
    if (nextLine.match(
      /^(%[0-9]+)\s:=\s(%[0-9]+)\s[\+\-]\s\#?[0-9]+$/gi
    )) {
      return this.parseSetValue(nextLine);
    }
    if (nextLine.match(
      /^PROGRAM$/gi
    )) {
      return { discriminator: 'whileMacroRunProgramInstruction' };
    }
    if (nextLine.match(/^END$/gi)) {
      return null;
    }
    this.parseErrors.push('invalid instruction inside macro: ' + nextLine);
    return null;
  }

  parseInstruction(eofAllowed = false): WhileInstruction | null {
    if (this.remainingLines.length === 0) {
      if (!eofAllowed) {
        this.parseErrors.push('end of file inside while');
      }
      return null;
    }
    const nextLine = this.remainingLines.splice(0, 1)[0].trim();
    if (nextLine.match(/^WHILE ((?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+)) DO$/gi)) {
      return this.parseWhile(nextLine);
    }
    if (nextLine.match(
      /^((?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))\s:=\s((?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))\s[\+\-]\s[0-9]+$/gi
    )) {
      return this.parseSetValue(nextLine);
    }
    if (nextLine.match(
      /^DEFINE\sMACRO\s((?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))$/gi
    )) {
      return this.parseDefineMacro(nextLine);
    }
    if (nextLine.match(
      /^USE\sMACRO\s((?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))( (?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)&([a-zA-Z0-9]+))*( (?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO)([0-9]+))*$/gi
    )) {
      return this.parseUseStaticMacro(nextLine);
    }
    if (nextLine.match(
      /^USE\sMACRO\s((?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))( (?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)&([a-zA-Z0-9]+))*( (?!WHILE|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO)([0-9]+))* DO$/gi
    )) {
      return this.parseUseProgramMacro(nextLine);
    }
    if (nextLine.match(/^END$/gi)) {
      return null;
    }
    this.parseErrors.push('invalid instruction: ' + nextLine);
    return null;
  }

  parseSetValue(instructionLine: string): WhileSetValueInstruction {
    const setVariable = instructionLine.slice(0, instructionLine.indexOf(' := '));
    const useVariable = instructionLine.slice(instructionLine.indexOf(' := ') + 4, instructionLine.search(/\s[\+\-]\s/));
    const plusMinus = instructionLine.substr(instructionLine.search(/\s[\+\-]\s/) + 1, 1);
    const useConstantNumPartString = instructionLine.slice(instructionLine.search(/\s[\+\-]\s/) + 3);
    const useConstant = plusMinus + useConstantNumPartString;
    return {
      setVariable, useVariable, useConstant, discriminator: 'whileSetValueInstruction'
    };
  }

  parseWhile(instructionLine: string): WhileWhileInstruction {
    const whileVar = instructionLine.slice(6, instructionLine.length - 3);
    const subRoutine: WhileProgram = this.parseSubRoutine();
    return {
      whileVariable: whileVar,
      do: subRoutine,
      discriminator: 'whileWhileInstruction'
    };
  }

  parseMacroWhile(instructionLine: string): WhileMacroWhileInstruction {
    const whileVar = instructionLine.slice(6, instructionLine.length - 3);
    const subRoutine: WhileMacro = this.parseMacroRoutine();
    return {
      whileVariable: whileVar,
      do: subRoutine,
      discriminator: 'whileMacroWhileInstruction'
    };
  }

  parseDefineMacro(instructionLine: string): WhileDefineMacroInstruction {
    const macroName = instructionLine.substr(13);
    const subRoutine: WhileMacro = this.parseMacroRoutine();
    return {
      name: macroName,
      macroCode: subRoutine,
      discriminator: 'whileDefineMacroInstruction'
    };
  }

  parseUseStaticMacro(instructionLine: string): WhileUseStaticMacroInstruction {
    const macroName = instructionLine.slice(10, instructionLine.indexOf(' ', 10));
    const parts = instructionLine.substr(instructionLine.indexOf(' ', 10) + 1).split(' ');
    const bindVars: string[] = [];
    const constants: number[] = [];
    parts.forEach(part => {
      if (part.startsWith('&')) {
        bindVars.push(part.substr(1));
      } else {
        constants.push(Number(part));
      }
    });
    return {
      name: macroName,
      bindVars,
      constants,
      discriminator: 'whileUseStaticMacroInstruction'
    };
  }

  parseUseProgramMacro(instructionLine: string): WhileUseProgramMacroInstruction {
    const macroName = instructionLine.slice(10, instructionLine.indexOf(' ', 10));
    const parts = instructionLine.slice(instructionLine.indexOf(' ', 10) + 1, instructionLine.length - 3).split(' ');
    const bindVars: string[] = [];
    const constants: number[] = [];
    parts.forEach(part => {
      if (part.startsWith('&')) {
        bindVars.push(part.substr(1));
      } else {
        constants.push(Number(part));
      }
    });
    const program = this.parseSubRoutine();
    return {
      name: macroName,
      bindVars,
      constants,
      program,
      discriminator: 'whileUseProgramMacroInstruction'
    };
  }

}
