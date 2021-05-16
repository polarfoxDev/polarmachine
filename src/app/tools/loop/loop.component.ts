import { Component, OnInit } from '@angular/core';
import { LoopDefineMacroInstruction, LoopInstruction, LoopLoopInstruction, LoopMacro, LoopMacroInstruction, LoopMacroLoopInstruction, LoopMacroRunProgramInstruction, LoopProgram, LoopSetValueInstruction, LoopUseProgramMacroInstruction, LoopUseStaticMacroInstruction } from './loop-program.interface';

@Component({
  selector: 'app-loop',
  templateUrl: './loop.component.html',
  styleUrls: ['./loop.component.scss']
})
export class LoopComponent implements OnInit {

  designer = true;
  codeInput = '';
  program: LoopProgram = [];
  macros: LoopDefineMacroInstruction[] = [];
  remainingLines: string[];

  constructor() { }

  ngOnInit(): void { }

  parse(): void {
    this.remainingLines = this.codeInput.split(/[\n;]/).filter(line => line.length > 0);
    this.program = this.parseSubRoutine(true);
    console.log(this.program);
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
      console.log('parse error', 'end of file inside macro');
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
      return {} as LoopMacroRunProgramInstruction;
    }
    if (nextLine.match(/END/gi)) {
      return null;
    }
    console.log('parse error', 'invalid instruction inside macro', nextLine);
  }

  parseInstruction(eofAllowed = false): LoopInstruction | null {
    if (this.remainingLines.length === 0) {
      if (!eofAllowed) {
        console.log('parse error', 'end of file inside loop');
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
    if (nextLine.match(/END/gi)) {
      return null;
    }
    console.log('parse error', 'invalid instruction', nextLine);
  }

  parseSetValue(instructionLine: string): LoopSetValueInstruction {
    const setVariable = instructionLine.slice(0, instructionLine.indexOf(' := '));
    const useVariable = instructionLine.slice(instructionLine.indexOf(' := ') + 4, instructionLine.search(/\s[\+\-]\s/));
    const plusMinus = instructionLine.substr(instructionLine.search(/\s[\+\-]\s/) + 1, 1);
    const useConstantNumPartString = instructionLine.slice(instructionLine.search(/\s[\+\-]\s/) + 3);
    const useConstant = Number(plusMinus + useConstantNumPartString);
    return {
      setVariable, useVariable, useConstant
    };
  }

  parseLoop(instructionLine: string): LoopLoopInstruction {
    const loopVar = instructionLine.slice(5, instructionLine.length - 3);
    const subRoutine: LoopProgram = this.parseSubRoutine();
    return {
      loopVariable: loopVar,
      do: subRoutine
    };
  }

  parseMacroLoop(instructionLine: string): LoopMacroLoopInstruction {
    const loopVar = instructionLine.slice(5, instructionLine.length - 3);
    const subRoutine: LoopMacro = this.parseMacroRoutine();
    return {
      loopVariable: loopVar,
      do: subRoutine
    };
  }

  parseDefineMacro(instructionLine: string): LoopDefineMacroInstruction {
    const macroName = instructionLine.substring(13);
    const subRoutine: LoopMacro = this.parseMacroRoutine();
    return {
      name: macroName,
      macroCode: subRoutine
    };
  }

  parseUseStaticMacro(instructionLine: string): LoopUseStaticMacroInstruction {
    const macroName = instructionLine.slice(10, instructionLine.indexOf(' ', 10));
    const parts = instructionLine.substring(instructionLine.indexOf(' ', 10) + 1).split(' ');
    const bindVars: string[] = [];
    const bindConsts: number[] = [];
    parts.forEach(part => {
      if (part.startsWith('&')) {
        bindVars.push(part.substring(1));
      } else {
        bindConsts.push(Number(part));
      }
    });
    return {
      name: macroName,
      bindVars,
      bindConsts
    };
  }

  parseUseProgramMacro(instructionLine: string): LoopUseProgramMacroInstruction {
    const macroName = instructionLine.slice(10, instructionLine.indexOf(' ', 10));
    const parts = instructionLine.slice(instructionLine.indexOf(' ', 10) + 1, instructionLine.length - 3).split(' ');
    const bindVars: string[] = [];
    const bindConsts: number[] = [];
    parts.forEach(part => {
      if (part.startsWith('&')) {
        bindVars.push(part.substring(1));
      } else {
        bindConsts.push(Number(part));
      }
    });
    const program = this.parseSubRoutine();
    return {
      name: macroName,
      bindVars,
      bindConsts,
      program
    };
  }

}
