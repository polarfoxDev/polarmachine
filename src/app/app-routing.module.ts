import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { LoopComponent } from './tools/loop/loop.component';
import { TuringMachineComponent } from './tools/turing-machine/turing-machine.component';
import { WhileComponent } from './tools/while/while.component';

const routes: Routes = [
  {
    path: '',
    component: OverviewComponent
  },
  {
    path: 'tool/tm',
    component: TuringMachineComponent
  },
  {
    path: 'tool/loop',
    component: LoopComponent
  },
  {
    path: 'tool/while',
    component: WhileComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
