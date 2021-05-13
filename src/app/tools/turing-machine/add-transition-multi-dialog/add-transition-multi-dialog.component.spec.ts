import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransitionMultiDialogComponent } from './add-transition-multi-dialog.component';

describe('AddTransitionDialogComponent', () => {
  let component: AddTransitionMultiDialogComponent;
  let fixture: ComponentFixture<AddTransitionMultiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTransitionMultiDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTransitionMultiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
