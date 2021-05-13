import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTransitionDialogComponent } from './add-transition-dialog/add-transition-dialog.component';
import { TMBand, TMMoveDirection, TMTransition, TuringMachineConfig } from './turing-machine-config.interface';
import { TuringMachineRunConfig } from './turing-machine-run-config.interface';
import { TuringMachineService } from './turing-machine.service';

@Component({
  selector: 'app-turing-machine',
  templateUrl: './turing-machine.component.html',
  styleUrls: ['./turing-machine.component.styl'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ width: 0, opacity: 0, marginRight: 0 }),
            animate('0.2s ease-out',
                    style({ width: 40, opacity: 1, marginRight: 10 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ width: 40, opacity: 1, marginRight: 10 }),
            animate('0.2s ease-in',
                    style({ width: 0, opacity: 0, marginRight: 0 }))
          ]
        )
      ]
    ),
    trigger(
      'inOutAnimationInvisible',
      [
        transition(
          ':enter',
          [
            style({ width: 0, marginRight: 0 }),
            animate('0.2s ease-out',
                    style({ width: 40, marginRight: 10 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ width: 40, marginRight: 10 }),
            animate('0.2s ease-in',
                    style({ width: 0, marginRight: 0 }))
          ]
        )
      ]
    )
  ]
})
export class TuringMachineComponent implements OnInit {

  tm: TuringMachineConfig = {
    bands: [{contentPositiveIndex: [], contentNegativeIndex: [], isOutputBand: true}],
    alphabet: '',
    transitions: []
  };
  runConfig: TuringMachineRunConfig = {
    delay: 1000,
    maxSteps: 60,
    bandInputs: ['']
  };
  running = false;
  validationResult: string;
  valid = false;
  designer = true;

  constructor(public dialog: MatDialog, public tmService: TuringMachineService) { }

  ngOnInit(): void {
    // this.tm.bands = [
    //   {contentPositiveIndex: ['1', '1'], contentNegativeIndex: []},
    //   {contentPositiveIndex: ['1', '0', '1', '0'], contentNegativeIndex: []},
    //   {contentPositiveIndex: [], contentNegativeIndex: [], isOutputBand: true}
    // ];
    // this.tm.finiteStates = [10, 100];
    // this.tm.transitions = [
    //    {inState: 0, read: [null, '0', null], write: [null, '0', null], toState: 0, move: ['not', 'right', 'not']},
    //    {inState: 0, read: [null, '1', null], write: [null, '1', null], toState: 0, move: ['not', 'right', 'not']},
    //    {inState: 0, read: ['0', null, null], write: ['0', null, null], toState: 0, move: ['right', 'not', 'not']},
    //    {inState: 0, read: ['0', '0', null], write: ['0', '0', null], toState: 0, move: ['right', 'right', 'not']},
    //    {inState: 0, read: ['0', '1', null], write: ['0', '1', null], toState: 0, move: ['right', 'right', 'not']},
    //    {inState: 0, read: ['1', null, null], write: ['1', null, null], toState: 0, move: ['right', 'not', 'not']},
    //    {inState: 0, read: ['1', '0', null], write: ['1', '0', null], toState: 0, move: ['right', 'right', 'not']},
    //    {inState: 0, read: ['1', '1', null], write: ['1', '1', null], toState: 0, move: ['right', 'right', 'not']},
    //    {inState: 0, read: [null, null, null], write: [null, null, null], toState: 1, move: ['left', 'left', 'not']},

    //    {inState: 1, read: [null, '0', null], write: [null, '0', '0'], toState: 1, move: ['not', 'left', 'left']},
    //    {inState: 1, read: [null, '1', null], write: [null, '1', '1'], toState: 1, move: ['not', 'left', 'left']},
    //    {inState: 1, read: ['0', null, null], write: ['0', null, '0'], toState: 1, move: ['left', 'not', 'left']},
    //    {inState: 1, read: ['0', '0', null], write: ['0', '0', '0'], toState: 1, move: ['left', 'left', 'left']},
    //    {inState: 1, read: ['0', '1', null], write: ['0', '1', '1'], toState: 1, move: ['left', 'left', 'left']},
    //    {inState: 1, read: ['1', null, null], write: ['1', null, '1'], toState: 1, move: ['left', 'not', 'left']},
    //    {inState: 1, read: ['1', '0', null], write: ['1', '0', '1'], toState: 1, move: ['left', 'left', 'left']},
    //    {inState: 1, read: ['1', '1', null], write: ['1', '1', '0'], toState: 2, move: ['left', 'left', 'left']},
    //    {inState: 1, read: [null, null, null], write: [null, null, null], toState: 10, move: ['right', 'right', 'right']},

    //    {inState: 2, read: [null, '0', null], write: [null, '0', '1'], toState: 1, move: ['not', 'left', 'left']},
    //    {inState: 2, read: [null, '1', null], write: [null, '1', '0'], toState: 2, move: ['not', 'left', 'left']},
    //    {inState: 2, read: ['0', null, null], write: ['0', null, '1'], toState: 1, move: ['left', 'not', 'left']},
    //    {inState: 2, read: ['0', '0', null], write: ['0', '0', '1'], toState: 1, move: ['left', 'left', 'left']},
    //    {inState: 2, read: ['0', '1', null], write: ['0', '1', '0'], toState: 2, move: ['left', 'left', 'left']},
    //    {inState: 2, read: ['1', null, null], write: ['1', null, '0'], toState: 2, move: ['left', 'not', 'left']},
    //    {inState: 2, read: ['1', '0', null], write: ['1', '0', '0'], toState: 2, move: ['left', 'left', 'left']},
    //    {inState: 2, read: ['1', '1', null], write: ['1', '1', '1'], toState: 2, move: ['left', 'left', 'left']},
    //    {inState: 2, read: [null, null, null], write: [null, null, '1'], toState: 10, move: ['right', 'right', 'not']},
    // ];
    // this.prepare();
    // const valid = this.validate();
    // if (!valid) {
    //   this.log('start', 'validation failed, canceled run');
    //   return;
    // }
    // this.run(100);
  }

  runMachine(): void {
    this.prepare();
    this.valid = this.validate();
    if (!this.valid) {
      return;
    }
    this.designer = false;
    this.run(this.runConfig.maxSteps, this.runConfig.delay);
  }

  addTransition(): void {
    const dialogRef = this.dialog.open(AddTransitionDialogComponent, {data: {bandCount: this.tm.bands.length}});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tm.transitions = [... this.tm.transitions, result];
      }
    });
  }

  removeTransition(transToRemove: TMTransition): void {
    this.tm.transitions = this.tm.transitions.filter(trans => trans !== transToRemove);
  }

  addBand(index: number): void {
    const newBand: TMBand = {contentPositiveIndex: [], contentNegativeIndex: []};
    this.tm.bands.splice(index, 0, newBand);
    this.tm.transitions.forEach(trans => {
      trans.read.splice(index, 0, null);
      trans.write.splice(index, 0, null);
      trans.move.splice(index, 0, 'not');
    });
    this.runConfig.bandInputs.splice(index, 0, '');
  }

  removeBand(index: number): void {
    this.tm.bands.splice(index, 1);
    this.tm.transitions.forEach(trans => {
      trans.read.splice(index, 1);
      trans.write.splice(index, 1);
      trans.move.splice(index, 1);
    });
    this.runConfig.bandInputs.splice(index, 1);
  }

  prepare(): void {
    this.log('prepare', 'preparing TM before running...');
    this.tm.state = 0;
    this.tm.bands.forEach(band => {
      band.position = 0;
      const index = this.tm.bands.findIndex(x => x === band);
      band.contentPositiveIndex = this.runConfig.bandInputs[index].split('').map(x => x === ' ' ? null : x);
      band.recentValueChange = false;
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
      output += this.getSymbol(outputBand, position, '␢');
    }
    output = output.trim();
    if (output.length === 0) {
      this.log('afterRun', 'output band empty');
      return;
    }
    this.log('afterRun', 'output: ' + output);
  }

  getSymbol(band: TMBand, position: number, blank: string = '␢'): string {
    const symbol = position < 0 ? (
      band.nonNegative ? null : band.contentNegativeIndex[-position - 1] || blank
    ) : band.contentPositiveIndex[position] || blank;
    return symbol;
  }

  run(maxSteps: number, delay: number): void {
    this.log('run', 'starting with a maximum of ' + maxSteps + ' steps in ' + (delay ? 'async' : 'instant') + ' mode');
    this.running = true;
    let steps = 0;
    const interval = setInterval(() => {
      steps++;
      this.running = this.step(steps, delay / 2);
      if (!this.running || steps >= maxSteps) {
        clearInterval(interval);
        this.running = false;
        this.log('run(async)', 'machine stopped');
        this.afterRun();
      }
    }, delay);
  }

  validate(): boolean {
    const invalidState = this.tm.state === null || this.tm.state === undefined || this.tm.state < 0;
    if (invalidState) {
      this.validationResult = 'Validation failed: The turing machine\'s state is invalid.';
      return false;
    }
    const undefinedBands = this.tm.bands.some(band => !band);
    if (undefinedBands) {
      this.validationResult = 'Validation failed: There are undefined bands.';
      return false;
    }
    const multipleOutputBands = this.tm.bands.filter(band => band.isOutputBand).length > 1;
    if (multipleOutputBands) {
      this.validationResult = 'Validation failed: There are multiple bands marked as output.';
      return false;
    }
    const invalidBandPositions = this.tm.bands.some(band => band.position === null || band.position === undefined || band.position < 0);
    if (invalidBandPositions) {
      this.validationResult = 'Validation failed: Some pointer position on a band is invalid.';
      return false;
    }
    const invalidAlphabet = this.tm.alphabet === null || this.tm.alphabet === undefined ||
      this.tm.alphabet.includes(' ') || this.tm.alphabet.includes('␢');
    if (invalidAlphabet) {
      this.validationResult = 'Validation failed: The alphabet is invalid.';
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
      this.validationResult = 'Validation failed: Some band contains invalid data (e.g. non-alphabet symbols).';
      console.log(this.tm.bands);
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
      this.validationResult = 'Validation failed: Some transition is invalid (e.g. use of non-alphabet symbols).';
      return false;
    }
    this.validationResult = 'Validation succeeded.';
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

  step(stepIndex: number, delayMove: number): boolean {
    this.log('step(' + stepIndex + ')', 'in state ' + this.tm.state);
    const read = this.tm.bands.map(
      band => band.position < 0 ? band.contentNegativeIndex[-band.position - 1] : band.contentPositiveIndex[band.position]
    );
    this.log('step(' + stepIndex + ')', 'read ' + JSON.stringify(read));
    const matchingTransition = this.tm.transitions.find(
      trans => trans.inState === this.tm.state && JSON.stringify(trans.read) === JSON.stringify(read)
    );
    if (!matchingTransition) {
      this.log('step(' + stepIndex + ')', 'no matching transition found');
      return false;
    }
    this.log('step(' + stepIndex + ')', 'use transition with index ' + this.tm.transitions.indexOf(matchingTransition));
    for (let index = 0; index < this.tm.bands.length; index++) {
      // to start value change animation
      this.tm.bands[index].recentValueChange = read[index]?.toString() !== matchingTransition.write[index]?.toString();
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
      setTimeout(() => {
        // to stop value change animation
        this.tm.bands[index].recentValueChange = false;
        const newPos = this.tm.bands[index].position + this.directionToIndexChange(matchingTransition.move[index]);
        if (this.tm.bands[index].nonNegative && newPos < 0) {
          this.log('step(' + stepIndex + ')', 'on band ' + index + ' forbidden move ' + matchingTransition.move[index] + ' (band is non-negative)');
        } else {
          this.tm.bands[index].position = newPos;
          this.log('step(' + stepIndex + ')', 'on band ' + index + ' move ' + matchingTransition.move[index]);
        }
      }, delayMove);
    }
    this.tm.state = matchingTransition.toState;
    if (this.tm.finiteStates?.includes(this.tm.state)) {
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
