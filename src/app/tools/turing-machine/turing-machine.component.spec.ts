import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuringMachineComponent } from './turing-machine.component';

describe('TuringMachineComponent', () => {
  let component: TuringMachineComponent;
  let fixture: ComponentFixture<TuringMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TuringMachineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TuringMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
