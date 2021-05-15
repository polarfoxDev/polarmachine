import { Component, OnInit } from '@angular/core';
import { LoopInstruction, LoopLoopInstruction, LoopMacro, LoopProgram, LoopSetValueInstruction } from './loop-program.interface';

@Component({
  selector: 'app-loop',
  templateUrl: './loop.component.html',
  styleUrls: ['./loop.component.scss']
})
export class LoopComponent implements OnInit {

  designer = true;
  codeInput = '';
  program: LoopProgram = [];
  macros: LoopMacro[] = [];
  remainingLines: string[];

  constructor() { }

  ngOnInit(): void { }

  parse(): void {
    this.remainingLines = this.codeInput.split(/[\n;]/).filter(line => line.length > 0);
    this.program = this.parseSubRoutine();
    console.log(this.program);
  }

  parseSubRoutine(): LoopProgram {
    const subRoutine: LoopProgram = [];
    let nextInstruction: LoopInstruction;
    do {
      nextInstruction = this.parseInstruction();
      if (nextInstruction) {
        subRoutine.push(nextInstruction);
      }
    } while (nextInstruction);
    return subRoutine;
  }

  parseInstruction(): LoopInstruction | null {
    if (this.remainingLines.length === 0) {
      console.log('possible parse error if not level 0');
      return null;
    }
    const nextLine = this.remainingLines.splice(0, 1)[0].trim();
    if (nextLine.match(/^LOOP ((?!LOOP|MACRO|DEFINE|USE|DO)([a-zA-Z0-9]+)) DO$/gi)) {
      return this.parseLoop(nextLine);
    }
    if (nextLine.match(
      /^((?!LOOP|MACRO|DEFINE|USE|DO)([a-zA-Z0-9]+))\s:=\s((?!LOOP|MACRO|DEFINE|USE|DO)([a-zA-Z0-9]+))\s[\+\-]\s[0-9]+$/gi
    )) {
      return this.parseSetValue(nextLine);
    }
    if (nextLine.match(/END/gi)) {
      return null;
    }
    console.log('parse error');
    // parse error: illegal instruction
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

}
