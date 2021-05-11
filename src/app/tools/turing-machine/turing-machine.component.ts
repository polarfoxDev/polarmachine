import { Component, OnInit } from '@angular/core';
import { TMBand, TMMoveDirection, TuringMachineConfig } from './turing-machine-config.interface';

@Component({
  selector: 'app-turing-machine',
  templateUrl: './turing-machine.component.html',
  styleUrls: ['./turing-machine.component.styl']
})
export class TuringMachineComponent implements OnInit {

  tm: TuringMachineConfig = {
    bands: [{contentPositiveIndex: []}],
    alphabet: '',
    transitions: []
  };
  running = false;

  constructor() { }

  ngOnInit(): void {
    this.tm.bands = [
      {contentPositiveIndex: ['1', '1'], contentNegativeIndex: []},
      {contentPositiveIndex: ['1', '0', '1', '0'], contentNegativeIndex: []},
      {contentPositiveIndex: [], contentNegativeIndex: [], isOutputBand: true}
    ];
    this.tm.finiteStates = [10];
    this.tm.transitions = [
       {inState: 0, read: [null, '0', null], write: [null, '0', null], toState: 0, move: ['not', 'right', 'not']},
       {inState: 0, read: [null, '1', null], write: [null, '1', null], toState: 0, move: ['not', 'right', 'not']},
       {inState: 0, read: ['0', null, null], write: ['0', null, null], toState: 0, move: ['right', 'not', 'not']},
       {inState: 0, read: ['0', '0', null], write: ['0', '0', null], toState: 0, move: ['right', 'right', 'not']},
       {inState: 0, read: ['0', '1', null], write: ['0', '1', null], toState: 0, move: ['right', 'right', 'not']},
       {inState: 0, read: ['1', null, null], write: ['1', null, null], toState: 0, move: ['right', 'not', 'not']},
       {inState: 0, read: ['1', '0', null], write: ['1', '0', null], toState: 0, move: ['right', 'right', 'not']},
       {inState: 0, read: ['1', '1', null], write: ['1', '1', null], toState: 0, move: ['right', 'right', 'not']},
       {inState: 0, read: [null, null, null], write: [null, null, null], toState: 1, move: ['left', 'left', 'not']},

       {inState: 1, read: [null, '0', null], write: [null, '0', '0'], toState: 1, move: ['not', 'left', 'left']},
       {inState: 1, read: [null, '1', null], write: [null, '1', '1'], toState: 1, move: ['not', 'left', 'left']},
       {inState: 1, read: ['0', null, null], write: ['0', null, '0'], toState: 1, move: ['left', 'not', 'left']},
       {inState: 1, read: ['0', '0', null], write: ['0', '0', '0'], toState: 1, move: ['left', 'left', 'left']},
       {inState: 1, read: ['0', '1', null], write: ['0', '1', '1'], toState: 1, move: ['left', 'left', 'left']},
       {inState: 1, read: ['1', null, null], write: ['1', null, '1'], toState: 1, move: ['left', 'not', 'left']},
       {inState: 1, read: ['1', '0', null], write: ['1', '0', '1'], toState: 1, move: ['left', 'left', 'left']},
       {inState: 1, read: ['1', '1', null], write: ['1', '1', '0'], toState: 2, move: ['left', 'left', 'left']},
       {inState: 1, read: [null, null, null], write: [null, null, null], toState: 10, move: ['right', 'right', 'right']},

       {inState: 2, read: [null, '0', null], write: [null, '0', '1'], toState: 1, move: ['not', 'left', 'left']},
       {inState: 2, read: [null, '1', null], write: [null, '1', '0'], toState: 2, move: ['not', 'left', 'left']},
       {inState: 2, read: ['0', null, null], write: ['0', null, '1'], toState: 1, move: ['left', 'not', 'left']},
       {inState: 2, read: ['0', '0', null], write: ['0', '0', '1'], toState: 1, move: ['left', 'left', 'left']},
       {inState: 2, read: ['0', '1', null], write: ['0', '1', '0'], toState: 2, move: ['left', 'left', 'left']},
       {inState: 2, read: ['1', null, null], write: ['1', null, '0'], toState: 2, move: ['left', 'not', 'left']},
       {inState: 2, read: ['1', '0', null], write: ['1', '0', '0'], toState: 2, move: ['left', 'left', 'left']},
       {inState: 2, read: ['1', '1', null], write: ['1', '1', '1'], toState: 2, move: ['left', 'left', 'left']},
       {inState: 2, read: [null, null, null], write: [null, null, '1'], toState: 10, move: ['right', 'right', 'not']},
     ];
    // this.tm.transitions = [
    //   {inState: 0, read: [null], write: ['0'], toState: 1, move: ['right']},
    //   {inState: 1, read: [null], write: ['1'], toState: 2, move: ['left']},
    //   {inState: 2, read: ['0'], write: ['0'], toState: 3, move: ['left']},
    //   {inState: 3, read: [null], write: ['1'], toState: 3, move: ['not']}
    // ];
    this.prepare();
    this.deriveAlphabetFromTransitions();
    const valid = this.validate();
    if (!valid) {
      this.log('start', 'validation failed, canceled run');
      return;
    }
    this.run(100);
  }

  prepare(): void {
    this.log('prepare', 'preparing TM before running...');
    this.tm.state = 0;
    this.tm.bands.forEach(band => {
      band.position = 0;
    });
  }

  afterRun(): void {
    this.log('afterRun', 'execution finished');
    const outputBand = this.tm.bands.find(band => band.isOutputBand);
    if (!outputBand) {
      this.log('afterRun', 'no output band');
      return;
    }
    let lowestIndex = 0;
    if (!outputBand.nonNegative) {
      lowestIndex = -outputBand.contentNegativeIndex.length;
    }
    let output = '';
    for (let position = lowestIndex; position < outputBand.contentPositiveIndex.length; position++) {
      output += this.getSymbol(outputBand, position, ' ');
    }
    output = output.trim();
    if (output.length === 0) {
      this.log('afterRun', 'output band empty');
      return;
    }
    this.log('afterRun', 'output: ' + output);
  }

  getSymbol(band: TMBand, position: number, blank: string): string {
    const symbol = position < 0 ? band.contentNegativeIndex[-position - 1] : band.contentPositiveIndex[position];
    return symbol || blank;
  }

  run(maxSteps: number, delay?: number): void {
    this.log('run', 'starting with a maximum of ' + maxSteps + ' steps in ' + (delay ? 'async' : 'instant') + ' mode');
    this.running = true;
    let steps = 0;
    if (delay) {
      const interval = setInterval(() => {
        steps++;
        this.running = this.step(steps);
        if (!this.running || steps >= maxSteps) {
          clearInterval(interval);
          this.running = false;
          this.log('run(async)', 'machine stopped');
          this.afterRun();
        }
      }, delay);
    } else {
      while (this.running && steps < maxSteps) {
        steps++;
        this.running = this.step(steps);
      }
      this.running = false;
      this.log('run(instant)', 'machine stopped');
      this.afterRun();
    }
  }

  validate(): boolean {
    const invalidState = this.tm.state === null || this.tm.state === undefined || this.tm.state < 0;
    if (invalidState) {
      this.log('validate', 'fail: invalidState');
      return false;
    }
    const undefinedBands = this.tm.bands.some(band => !band);
    if (undefinedBands) {
      this.log('validate', 'fail: undefinedBands');
      return false;
    }
    const multipleOutputBands = this.tm.bands.filter(band => band.isOutputBand).length > 1;
    if (multipleOutputBands) {
      this.log('validate', 'fail: multipleOutputBands');
      return false;
    }
    const invalidBandPositions = this.tm.bands.some(band => band.position === null || band.position === undefined || band.position < 0);
    if (invalidBandPositions) {
      this.log('validate', 'fail: invalidBandPositions');
      return false;
    }
    const invalidAlphabet = !this.tm.alphabet || this.tm.alphabet.length < 1 || this.tm.alphabet.includes(' ');
    if (invalidAlphabet) {
      this.log('validate', 'fail: invalidAlphabet');
      return false;
    }
    const invalidBandContents = this.tm.bands.some(band =>
      band.contentPositiveIndex === null || band.contentPositiveIndex === undefined ||
      (!band.nonNegative && (band.contentNegativeIndex === null || band.contentNegativeIndex === undefined)) ||
      band.contentPositiveIndex.some(symbol =>
        symbol?.length > 1 || (symbol && !this.tm.alphabet.includes(symbol))
      ) ||
      (!band.nonNegative && (band.contentNegativeIndex.some(symbol =>
        symbol?.length > 1 || (symbol && !this.tm.alphabet.includes(symbol))
      )))
    );
    if (invalidBandContents) {
      this.log('validate', 'fail: invalidBandContents');
      return false;
    }
    const invalidTransitions = this.tm.transitions.some(trans =>
      trans.inState === undefined || trans.inState === null || trans.inState < 0 ||
      trans.toState === undefined || trans.toState === null || trans.toState < 0 ||
      trans.read.length !== this.tm.bands.length || trans.write.length !== this.tm.bands.length ||
      trans.read.some(symbol =>
        symbol?.length > 1 || (symbol && !this.tm.alphabet.includes(symbol))
      ) ||
      trans.write.some(symbol =>
        symbol?.length > 1 || (symbol && !this.tm.alphabet.includes(symbol))
      ) || !trans.move
    );
    if (invalidTransitions) {
      this.log('validate', 'fail: invalidTransitions');
      return false;
    }
    this.log('validate', 'success');
    return true;
  }

  deriveAlphabetFromTransitions(): void {
    const symbols = [];
    this.tm.transitions.forEach(trans => {
      trans.read.forEach(symbol => symbols.push(symbol));
      trans.write.forEach(symbol => symbols.push(symbol));
    });
    this.tm.alphabet = [... (new Set(symbols))].join('');
  }

  log(service: string, action: string): void {
    console.log('@' + service + ': ' + action);
  }

  step(stepIndex: number): boolean {
    this.log('step(' + stepIndex + ')', 'in state ' + this.tm.state);
    const read = this.tm.bands.map(
      band => band.position < 0 ? band.contentNegativeIndex[-band.position - 1] : band.contentPositiveIndex[band.position]
    );
    this.log('step(' + stepIndex + ')', 'read ' + JSON.stringify(read));
    const matchingTransition = this.tm.transitions.find(
      transition => transition.inState === this.tm.state && JSON.stringify(transition.read) === JSON.stringify(read)
    );
    if (!matchingTransition) {
      this.log('step(' + stepIndex + ')', 'no matching transition found');
      return false;
    }
    this.log('step(' + stepIndex + ')', 'use transition with index ' + this.tm.transitions.indexOf(matchingTransition));
    for (let index = 0; index < this.tm.bands.length; index++) {
      const position = this.tm.bands[index].position;
      if (position < 0) {
        this.tm.bands[index].contentNegativeIndex[-position - 1] = matchingTransition.write[index];
        // tslint:disable-next-line: max-line-length
        this.log('step(' + stepIndex + ')', 'on band ' + index + ' at position ' + position + ' (left array index ' + (-position - 1).toString() + ') wrote ' + matchingTransition.write[index]);
      } else {
        this.tm.bands[index].contentPositiveIndex[position] = matchingTransition.write[index];
        // tslint:disable-next-line: max-line-length
        this.log('step(' + stepIndex + ')', 'on band ' + index + ' at position ' + (position).toString() + ' wrote ' + matchingTransition.write[index]);
      }
      this.tm.bands[index].position += this.directionToIndexChange(matchingTransition.move[index]);
      if (this.tm.bands[index].nonNegative && this.tm.bands[index].position < 0) {
        this.tm.bands[index].position = 0;
        this.log('step(' + stepIndex + ')', 'on band ' + index + ' forbidden move ' + matchingTransition.move[index] + ' (band is non-negative)');
      } else {
        this.log('step(' + stepIndex + ')', 'on band ' + index + ' move ' + matchingTransition.move[index]);
      }
    }
    this.tm.state = matchingTransition.toState;
    if (this.tm.finiteStates.includes(this.tm.state)) {
      this.log('step(' + stepIndex + ')', 'reached finite state ' + this.tm.state);
      return false;
    }
    return true;
  }

  directionToIndexChange(direction: TMMoveDirection): number {
    switch (direction) {
      case 'left':
        return -1;
      case 'right':
        return 1;
      default:
        return 0;
    }
  }

}
