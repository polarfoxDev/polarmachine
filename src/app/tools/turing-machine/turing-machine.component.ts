import { trigger, transition, style, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTransitionDialogComponent } from './add-transition-dialog/add-transition-dialog.component';
import { AddTransitionMultiDialogComponent } from './add-transition-multi-dialog/add-transition-multi-dialog.component';
import { TuringMachineConfig, TMTransition, TMBand, TMMoveDirection } from './turing-machine-config.interface';
import { TuringMachineRunConfig } from './turing-machine-run-config.interface';
import { TMStep, TMStepBandSymbol } from './turing-machine-run-step.interface';
import { TuringMachineService } from './turing-machine.service';

@Component({
  selector: 'app-turing-machine',
  templateUrl: './turing-machine.component.html',
  styleUrls: ['./turing-machine.component.scss'],
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
export class TuringMachineComponent {

  tm: TuringMachineConfig = {
    bands: [{ contentPositiveIndex: [], contentNegativeIndex: [], isOutputBand: true, position: 0 }],
    alphabet: '',
    transitions: [],
    state: null,
  };
  runConfig: TuringMachineRunConfig = {
    delay: 1000,
    maxSteps: 60,
    bandInputs: ['']
  };
  finalStatesCSL = '';
  running = false;
  interval: any;
  history: TMStep[] = [];
  output: string | null = null;
  validationResult: string = '';
  valid = false;
  designer = true;
  forcedStop = false;
  noTransStop = false;

  constructor(public dialog: MatDialog, public tmService: TuringMachineService) { }

  ngOnInit(): void { }

  runMachine(): void {
    this.prepare();
    this.valid = this.validate();
    if (!this.valid) {
      return;
    }
    this.designer = false;
    this.run(this.runConfig.maxSteps, this.runConfig.delay);
  }

  stopMachine(): void {
    this.running = false;
    clearInterval(this.interval);
  }

  addTransition(): void {
    const dialogRef = this.dialog.open(AddTransitionDialogComponent, { data: { bandCount: this.tm.bands.length } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tm.transitions = [... this.tm.transitions, result];
      }
    });
  }

  addTransitions(): void {
    const dialogRef = this.dialog.open(AddTransitionMultiDialogComponent, { data: { bandCount: this.tm.bands.length } });
    dialogRef.afterClosed().subscribe(results => {
      if (results && results.length > 0) {
        this.tm.transitions = [... this.tm.transitions, ...results];
      }
    });
  }

  removeTransition(transToRemove: TMTransition): void {
    this.tm.transitions = this.tm.transitions.filter(trans => trans !== transToRemove);
  }

  addBand(index: number): void {
    const newBand: TMBand = { contentPositiveIndex: [], contentNegativeIndex: [], position: 0 };
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
    this.tm.finalStates = this.finalStatesCSL.length > 0 ? this.finalStatesCSL.split(',').map(x => Number(x)) : [];
    this.tm.state = 0;
    this.tm.bands.forEach(band => {
      band.position = 0;
      const index = this.tm.bands.findIndex(x => x === band);
      band.contentPositiveIndex = this.runConfig.bandInputs[index].split('').map(x => x === ' ' ? null : x);
      band.contentNegativeIndex = [];
      band.recentValueChange = false;
      if (!band.contentPositiveIndex[0]) {
        band.contentPositiveIndex[0] = null;
      }
    });
    this.history = [];
    this.output = null;
    this.forcedStop = false;
    this.noTransStop = false;
  }

  afterRun(): void {
    this.history = [... this.history, {
      trans: null,
      state: this.tm.state,
      bandContents: this.tm.bands.map(band => this.getBandContent(band, true))
    }];
    const outputBand = this.tm.bands.find(band => band.isOutputBand);
    if (!outputBand) {
      return;
    }
    this.output = this.getBandContent(outputBand).map(x => x.symbol).join('');
  }

  getBandContent(band: TMBand, positionMode = false): TMStepBandSymbol[] {
    let lowestIndex = 0;
    if (!band.nonNegative) {
      lowestIndex = -(band.contentNegativeIndex ?? []).length;
    }
    let symbols: TMStepBandSymbol[] = [];
    for (let position = lowestIndex - 1; position < band.contentPositiveIndex.length + 1; position++) {
      symbols.push({
        symbol: this.getSymbol(band, position, '␢'),
        isCurrentPosition: band.position === position
      });
    }
    if (!positionMode) {
      const symbolString = symbols.map(x => x.symbol).join('').replace(/^␢+|␢+$/g, '');
      symbols = symbolString.split('').map(x => ({ symbol: x, isCurrentPosition: false }));
    }
    return symbols;
  }

  getSymbol(band: TMBand, position: number, blank: string = '␢'): string | null {
    const symbol = position < 0 ? (
      band.nonNegative ? null : (band.contentNegativeIndex ?? [])[-position - 1] || blank
    ) : band.contentPositiveIndex[position] || blank;
    return symbol;
  }

  run(maxSteps: number, delay: number): void {
    this.running = true;
    let steps = 0;
    this.interval = setInterval(() => {
      steps++;
      if (!this.running || steps > maxSteps) {
        clearInterval(this.interval);
        this.running = false;
        this.forcedStop = true;
        this.afterRun();
        return;
      }
      this.step(delay / 2);
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
        symbol && symbol.length > 1 || (symbol && !this.tm.alphabet.includes(symbol))
      ) ||
      (!band.nonNegative && (band.contentNegativeIndex?.some(symbol =>
        symbol && symbol.length > 1 || (symbol && !this.tm.alphabet.includes(symbol))
      )))
    );
    if (invalidBandContents) {
      this.validationResult = 'Validation failed: Some band contains invalid data (e.g. non-alphabet symbols).';
      return false;
    }
    const invalidTransitions = this.tm.transitions.some(trans =>
      trans.inState === undefined || trans.inState === null || trans.inState < 0 ||
      trans.toState === undefined || trans.toState === null || trans.toState < 0 ||
      trans.read.length !== this.tm.bands.length || trans.write.length !== this.tm.bands.length ||
      trans.read.some(symbol =>
        symbol && symbol.length > 1 || (symbol && !this.tm.alphabet.includes(symbol))
      ) ||
      trans.write.some(symbol =>
        symbol && symbol.length > 1 || (symbol && !this.tm.alphabet.includes(symbol))
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
    const symbols: (string | null)[] = [];
    this.tm.transitions.forEach(trans => {
      trans.read.forEach(symbol => symbols.push(symbol));
      trans.write.forEach(symbol => symbols.push(symbol));
    });
    this.tm.alphabet = [... (new Set(symbols))].join('');
  }

  step(delayMove: number): void {
    const currentState = this.tm.state;
    const read = this.tm.bands.map(
      band => band.position && band.position < 0 ? (band.contentNegativeIndex ?? [])[-band.position - 1] : band.contentPositiveIndex[band.position ?? 0]
    );
    const matchingTransition = this.tm.transitions.find(
      trans => trans.inState === currentState && JSON.stringify(trans.read) === JSON.stringify(read)
    );
    if (!matchingTransition) {
      clearInterval(this.interval);
      this.running = false;
      this.noTransStop = true;
      this.afterRun();
      return;
    }
    this.history = [... this.history, {
      trans: matchingTransition,
      state: currentState,
      bandContents: this.tm.bands.map(band => this.getBandContent(band, true))
    }];
    for (let index = 0; index < this.tm.bands.length; index++) {
      // to start value change animation
      this.tm.bands[index].recentValueChange = read[index]?.toString() !== matchingTransition.write[index]?.toString();
      const position = this.tm.bands[index].position as number;
      if (position < 0) {
        this.tm.bands[index].contentNegativeIndex[-position - 1] = matchingTransition.write[index];
      } else {
        this.tm.bands[index].contentPositiveIndex[position] = matchingTransition.write[index];
      }
    }
    setTimeout(() => {
      for (let index = 0; index < this.tm.bands.length; index++) {
        // to stop value change animation
        this.tm.bands[index].recentValueChange = false;
        const newPos = (this.tm.bands[index].position ?? 0) + this.directionToIndexChange(matchingTransition.move[index]);
        if (!(this.tm.bands[index].nonNegative && newPos < 0)) {
          this.tm.bands[index].position = newPos;
        }
        this.tm.state = matchingTransition.toState;
      }
      if (matchingTransition.toState !== null && this.tm.finalStates?.includes(matchingTransition.toState)) {
        clearInterval(this.interval);
        this.running = false;
        this.afterRun();
      }
    }, delayMove);
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
