import { Component, OnInit } from '@angular/core';
import {
  LoopDefineMacroInstruction,
  LoopExecutionStep,
  LoopInstruction,
  LoopLoopInstruction,
  LoopMacro,
  LoopMacroInstruction,
  LoopMacroLoopInstruction,
  LoopProgram,
  LoopSetValueInstruction,
  LoopUseProgramMacroInstruction,
  LoopUseStaticMacroInstruction
} from './loop-program.interface';

@Component({
  selector: 'app-loop',
  templateUrl: './loop.component.html',
  styleUrls: ['./loop.component.scss']
})
export class LoopComponent implements OnInit {

  showingSyntax = true;
  codeInput = '';
  program: LoopProgram = [];
  macros: LoopDefineMacroInstruction[] = [];
  remainingLines: string[];
  parseErrors: string[] = [];
  runtimeErrors: string[] = [];
  vars: { [id: string]: number; } = {};
  tempMacroVarNames: string[] = [];
  history: LoopExecutionStep[] = [];
  valueInputString = '';

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
    this.valueInputString.split(',').forEach((x, i) => this.setVar('input' + i, Number(x.trim())));
    if (Object.values(this.vars).some(x => isNaN(x))) {
      this.parseErrors.push('Invalid input');
      return;
    }
    this.setVar('output', 0);
    this.runSubRoutine(this.program);
    this.history = [... this.history, {instruction: null, vars: {... this.vars}, scope: 'main'}];
  }

  runSubRoutine(program: LoopProgram): void {
    program.forEach(instruction => {
      this.history.push({instruction, vars: {... this.vars}, scope: 'main'});
      switch (instruction.discriminator) {
        case 'loopSetValueInstruction':
          this.setVar(instruction.setVariable, this.getVar(instruction.useVariable) + Number(instruction.useConstant));
          break;
        case 'loopLoopInstruction':
          for (let index = 0; index < this.getVar(instruction.loopVariable); index++) {
            this.runSubRoutine(instruction.do);
          }
          break;
        case 'loopDefineMacroInstruction':
          this.macros.push(instruction);
          break;
        case 'loopUseStaticMacroInstruction':
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
        case 'loopUseProgramMacroInstruction':
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

  runMacro(macroId: number, macro: LoopMacro, bindVars: string[], constants: number[], callback?: LoopProgram): void {
    macro.forEach(instruction => {
      this.history.push({instruction, vars: {... this.vars}, scope: '@macro(' + macroId + ')'});
      switch (instruction.discriminator) {
        case 'loopSetValueInstruction':
          this.setVar(
            this.getMacroVarName(macroId, instruction.setVariable, bindVars),
            this.getVar(this.getMacroVarName(macroId, instruction.useVariable, bindVars))
            +
            this.getMacroConstant(instruction.useConstant, constants)
          );
          break;
        case 'loopMacroLoopInstruction':
          for (let index = 0; index < this.getVar(this.getMacroVarName(macroId, instruction.loopVariable, bindVars)); index++) {
            this.runMacro(macroId, instruction.do, bindVars, constants, callback);
          }
          break;
        case 'loopMacroRunProgramInstruction':
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

  parseSubRoutine(isBaseLevel = false): LoopProgram {
    const subRoutine: LoopProgram = [];
    let nextInstruction: LoopInstruction;
    do {
      nextInstruction = this.parseInstruction(isBaseLevel);
      if (nextInstruction) {
        subRoutine.push(nextInstruction);
      }
    } while (nextInstruction);
    return subRoutine;
  }

  parseMacroRoutine(): LoopMacro {
    const subRoutine: LoopMacro = [];
    let nextInstruction: LoopMacroInstruction;
    do {
      nextInstruction = this.parseMacroInstruction();
      if (nextInstruction) {
        subRoutine.push(nextInstruction);
      }
    } while (nextInstruction);
    return subRoutine;
  }

  parseMacroInstruction(): LoopMacroInstruction | null {
    if (this.remainingLines.length === 0) {
      this.parseErrors.push('end of file inside macro');
      return null;
    }
    const nextLine = this.remainingLines.splice(0, 1)[0].trim();
    if (nextLine.match(/^LOOP (%[0-9]+) DO$/gi)) {
      return this.parseMacroLoop(nextLine);
    }
    if (nextLine.match(
      /^(%[0-9]+)\s:=\s(%[0-9]+)\s[\+\-]\s\#?[0-9]+$/gi
    )) {
      return this.parseSetValue(nextLine);
    }
    if (nextLine.match(
      /^PROGRAM$/gi
    )) {
      return { discriminator: 'loopMacroRunProgramInstruction' };
    }
    if (nextLine.match(/^END$/gi)) {
      return null;
    }
    this.parseErrors.push('invalid instruction inside macro: ' + nextLine);
  }

  parseInstruction(eofAllowed = false): LoopInstruction | null {
    if (this.remainingLines.length === 0) {
      if (!eofAllowed) {
        this.parseErrors.push('end of file inside loop');
      }
      return null;
    }
    const nextLine = this.remainingLines.splice(0, 1)[0].trim();
    if (nextLine.match(/^LOOP ((?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+)) DO$/gi)) {
      return this.parseLoop(nextLine);
    }
    if (nextLine.match(
      /^((?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))\s:=\s((?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))\s[\+\-]\s[0-9]+$/gi
    )) {
      return this.parseSetValue(nextLine);
    }
    if (nextLine.match(
      /^DEFINE\sMACRO\s((?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))$/gi
    )) {
      return this.parseDefineMacro(nextLine);
    }
    if (nextLine.match(
      /^USE\sMACRO\s((?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))( (?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)&([a-zA-Z0-9]+))*( (?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO)([0-9]+))*$/gi
    )) {
      return this.parseUseStaticMacro(nextLine);
    }
    if (nextLine.match(
      /^USE\sMACRO\s((?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)([a-zA-Z0-9]+))( (?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO|[0-9]+)&([a-zA-Z0-9]+))*( (?!LOOP|END|STATIC|PROGRAM|MACRO|DEFINE|USE|DO)([0-9]+))* DO$/gi
    )) {
      return this.parseUseProgramMacro(nextLine);
    }
    if (nextLine.match(/^END$/gi)) {
      return null;
    }
    this.parseErrors.push('invalid instruction: ' + nextLine);
  }

  parseSetValue(instructionLine: string): LoopSetValueInstruction {
    const setVariable = instructionLine.slice(0, instructionLine.indexOf(' := '));
    const useVariable = instructionLine.slice(instructionLine.indexOf(' := ') + 4, instructionLine.search(/\s[\+\-]\s/));
    const plusMinus = instructionLine.substr(instructionLine.search(/\s[\+\-]\s/) + 1, 1);
    const useConstantNumPartString = instructionLine.slice(instructionLine.search(/\s[\+\-]\s/) + 3);
    const useConstant = plusMinus + useConstantNumPartString;
    return {
      setVariable, useVariable, useConstant, discriminator: 'loopSetValueInstruction'
    };
  }

  parseLoop(instructionLine: string): LoopLoopInstruction {
    const loopVar = instructionLine.slice(5, instructionLine.length - 3);
    const subRoutine: LoopProgram = this.parseSubRoutine();
    return {
      loopVariable: loopVar,
      do: subRoutine,
      discriminator: 'loopLoopInstruction'
    };
  }

  parseMacroLoop(instructionLine: string): LoopMacroLoopInstruction {
    const loopVar = instructionLine.slice(5, instructionLine.length - 3);
    const subRoutine: LoopMacro = this.parseMacroRoutine();
    return {
      loopVariable: loopVar,
      do: subRoutine,
      discriminator: 'loopMacroLoopInstruction'
    };
  }

  parseDefineMacro(instructionLine: string): LoopDefineMacroInstruction {
    const macroName = instructionLine.substr(13);
    const subRoutine: LoopMacro = this.parseMacroRoutine();
    return {
      name: macroName,
      macroCode: subRoutine,
      discriminator: 'loopDefineMacroInstruction'
    };
  }

  parseUseStaticMacro(instructionLine: string): LoopUseStaticMacroInstruction {
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
      discriminator: 'loopUseStaticMacroInstruction'
    };
  }

  parseUseProgramMacro(instructionLine: string): LoopUseProgramMacroInstruction {
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
      discriminator: 'loopUseProgramMacroInstruction'
    };
  }

}
