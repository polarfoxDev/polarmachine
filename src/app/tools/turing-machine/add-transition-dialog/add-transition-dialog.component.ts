import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TMTransition } from '../turing-machine-config.interface';
import { TuringMachineService } from '../turing-machine.service';

@Component({
  selector: 'app-add-transition-dialog',
  templateUrl: './add-transition-dialog.component.html',
  styleUrls: ['./add-transition-dialog.component.styl']
})
export class AddTransitionDialogComponent implements OnInit {

  valid = false;

  trans: TMTransition = {
    inState: null,
    read: [],
    toState: null,
    write: [],
    move: []
  };
  transStr = {
    inState: '',
    read: '',
    toState: '',
    write: '',
    move: ''
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {bandCount: number},
    private dialogRef: MatDialogRef<AddTransitionDialogComponent>,
    public tmService: TuringMachineService
  ) { }

  ngOnInit(): void {
  }

  interpretInput(): void {
    const inState = Number(this.transStr.inState);
    if (!isNaN(inState) && inState >= 0) {
      this.trans.inState = inState;
    }
    const toState = Number(this.transStr.toState);
    if (!isNaN(toState) && inState >= 0) {
      this.trans.toState = toState;
    }
    const read = this.transStr.read.split(',');
    if (read.length === this.data.bandCount && read.every(x => x.trim().length <= 1)) {
      this.trans.read = read.map(x => x.trim()).map(x => x.length === 1 ? x : null);
    }
    const write = this.transStr.write.split(',');
    if (write.length === this.data.bandCount && write.every(x => x.trim().length <= 1)) {
      this.trans.write = write.map(x => x.trim()).map(x => x.length === 1 ? x : null);
    }
    const move = this.transStr.move.split(',');
    if (move.length === this.data.bandCount && move.every(x => x.trim().length === 1)) {
      this.trans.move = move.map(x => x.trim()).map(x => x.length === 1 ? x : null).map(x => {
        return x.toLowerCase() === 'l' ? 'left' : (
          x.toLowerCase() === 'r' ? 'right' : 'not'
        );
      });
    }
    this.validate();
  }

  validate(): void {
    this.valid = (
      this.trans.inState !== undefined &&
      this.trans.inState !== null &&
      this.trans.inState >= 0 &&
      this.trans.toState !== undefined &&
      this.trans.toState !== null &&
      this.trans.toState >= 0 &&
      this.trans.move.length === this.data.bandCount &&
      this.trans.read.length === this.data.bandCount &&
      this.trans.write.length === this.data.bandCount
    );
  }

  submit(): void {
    this.dialogRef.close(this.trans);
  }

}
