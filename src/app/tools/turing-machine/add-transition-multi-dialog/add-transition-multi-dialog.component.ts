import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TMTransition } from '../turing-machine-config.interface';
import { TuringMachineService } from '../turing-machine.service';

@Component({
  selector: 'app-add-transition-multi-dialog',
  templateUrl: './add-transition-multi-dialog.component.html',
  styleUrls: ['./add-transition-multi-dialog.component.styl']
})
export class AddTransitionMultiDialogComponent implements OnInit {

  valid = false;

  transList: TMTransition[] = [];
  transText = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {bandCount: number},
    private dialogRef: MatDialogRef<AddTransitionMultiDialogComponent>,
    public tmService: TuringMachineService
  ) { }

  ngOnInit(): void {
    let exampleRead = '';
    let exampleWrite = '';
    let exampleMove = '';
    for (let index = 0; index < this.data.bandCount; index++) {
      exampleRead += (exampleRead.length > 1 ? ',' : '') + 'a';
      exampleWrite += (exampleWrite.length > 1 ? ',' : '') + 'b';
      exampleMove += (exampleMove.length > 1 ? ',' : '') + 'R';
    }
    this.transText = '0 # ' + exampleRead + ' # ' + exampleWrite + ' # 0 # ' + exampleMove + ' // example transition';
    this.interpretInput();
  }

  interpretInput(): void {
    this.transList = this.transText.split('\n').map(transStr => this.interpretTransition(transStr));
    this.validate();
  }

  interpretTransition(transStr: string): TMTransition {
    const trans: TMTransition = {
      inState: null,
      read: [],
      toState: null,
      write: [],
      move: []
    };
    const noComment = transStr.split(' // ')[0];
    const parts = noComment.split(' # ');
    if (parts.length !== 5) {
      return trans;
    }
    const inState = Number(parts[0]);
    if (!isNaN(inState) && inState >= 0) {
      trans.inState = inState;
    }
    const toState = Number(parts[3]);
    if (!isNaN(toState) && inState >= 0) {
      trans.toState = toState;
    }
    const read = parts[1].split(',');
    if (read.length === this.data.bandCount && read.every(x => x.trim().length <= 1)) {
      trans.read = read.map(x => x.trim()).map(x => x.length === 1 ? x : null);
    }
    const write = parts[2].split(',');
    if (write.length === this.data.bandCount && write.every(x => x.trim().length <= 1)) {
      trans.write = write.map(x => x.trim()).map(x => x.length === 1 ? x : null);
    }
    const move = parts[4].split(',');
    if (move.length === this.data.bandCount && move.every(x => x.trim().length === 1)) {
      trans.move = move.map(x => x.trim()).map(x => x.length === 1 ? x : null).map(x => {
        return x.toLowerCase() === 'l' ? 'left' : (
          x.toLowerCase() === 'r' ? 'right' : 'not'
        );
      });
    }
    return trans;
  }

  validate(): void {
    this.valid = this.transList.every(trans =>
      trans.inState !== undefined &&
      trans.inState !== null &&
      trans.inState >= 0 &&
      trans.toState !== undefined &&
      trans.toState !== null &&
      trans.toState >= 0 &&
      trans.move.length === this.data.bandCount &&
      trans.read.length === this.data.bandCount &&
      trans.write.length === this.data.bandCount
    );
  }

  submit(): void {
    this.dialogRef.close(this.transList);
  }

}
