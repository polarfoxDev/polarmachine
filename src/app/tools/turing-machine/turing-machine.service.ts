import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TuringMachineService {

  constructor() { }

  symbolsToString(data: string[], showArrayStructure = true): string {
    let separator = ''; let prefix = ''; let suffix = '';
    if (showArrayStructure) {
      separator = ','; prefix = '['; suffix = ']';
    }
    return prefix + data.map(x => x || '␢').join(separator) + suffix;
  }
}
