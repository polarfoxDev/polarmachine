import { Component, OnInit } from '@angular/core';
import { TMMoveDirection, TuringMachineConfig } from './turing-machine-config.interface';

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
    this.tm.transitions = [
      {inState: 0, read: [null], write: ['0'], toState: 1, move: ['right']},
      {inState: 1, read: [null], write: ['1'], toState: 2, move: ['left']},
      {inState: 2, read: ['0'], write: ['0'], toState: 3, move: ['left']},
      {inState: 3, read: [null], write: ['1'], toState: 3, move: ['not']}
    ];
    this.prepare();
    this.run(100);
  }

  prepare(input?: string): void {
    this.tm.state = 0;
    this.tm.bands.forEach(band => {
      band.contentNegativeIndex = [];
      band.contentPositiveIndex = [];
      if (!band.isInputBand && input?.length > 0) {
        band.contentPositiveIndex = input.split('');
      }
      band.position = 0;
    });
  }

  run(maxSteps: number, delay?: number): void {
    this.running = true;
    let steps = 0;
    if (delay) {
      const interval = setInterval(() => {
        this.running = this.step();
        steps++;
        if (!this.running || steps >= maxSteps) {
          clearInterval(interval);
          this.running = false;
          this.log('machine stopped');
        }
      }, delay);
    } else {
      while (this.running && steps < maxSteps) {
        this.running = this.step();
        steps++;
      }
      this.running = false;
      this.log('machine stopped');
    }
  }

  log(action: string, value?: object): void {
    console.log(action + ' ', JSON.stringify(value));
  }

  step(): boolean {
    const read = this.tm.bands.map(
      band => band.position < 0 ? band.contentNegativeIndex[-band.position - 1] : band.contentPositiveIndex[band.position]
    );
    this.log('read', read);
    const matchingTransition = this.tm.transitions.find(
      transition => transition.inState === this.tm.state && JSON.stringify(transition.read) === JSON.stringify(read)
    );
    if (!matchingTransition) {
      this.log('no matching transition found');
      return false;
    }
    this.log('use transition', matchingTransition);
    for (let index = 0; index < this.tm.bands.length; index++) {
      const position = this.tm.bands[index].position;
      if (position < 0) {
        this.tm.bands[index].contentNegativeIndex[-position - 1] = matchingTransition.write[index];
        // tslint:disable-next-line: max-line-length
        this.log('on band ' + index + ' at position ' + position + ' (left array index ' + (-position - 1).toString() + ') wrote ' + matchingTransition.write[index]);
      } else {
        this.tm.bands[index].contentPositiveIndex[position] = matchingTransition.write[index];
        this.log('on band ' + index + ' at position ' + (position).toString() + ' wrote ' + matchingTransition.write[index]);
      }
      this.tm.bands[index].position += this.directionToIndexChange(matchingTransition.move[index]);
      this.log('on band ' + index + ' move ' + matchingTransition.move[index]);
    }
    this.tm.state = matchingTransition.toState;
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
