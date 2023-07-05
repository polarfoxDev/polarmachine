import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuringMachineComponent } from './turing-machine.component';

describe('TuringMachineComponent', () => {
  let component: TuringMachineComponent;
  let fixture: ComponentFixture<TuringMachineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TuringMachineComponent]
    });
    fixture = TestBed.createComponent(TuringMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
