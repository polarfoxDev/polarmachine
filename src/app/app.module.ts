import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverviewComponent } from './overview/overview.component';
import { TuringMachineComponent } from './tools/turing-machine/turing-machine.component';
import { AddTransitionDialogComponent } from './tools/turing-machine/add-transition-dialog/add-transition-dialog.component';
// tslint:disable-next-line: max-line-length
import { AddTransitionMultiDialogComponent } from './tools/turing-machine/add-transition-multi-dialog/add-transition-multi-dialog.component';
import { FormsModule } from '@angular/forms';
import { LoopComponent } from './tools/loop/loop.component';

@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    TuringMachineComponent,
    AddTransitionDialogComponent,
    AddTransitionMultiDialogComponent,
    LoopComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSidenavModule,
    MatDialogModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatInputModule,
    MatCardModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
