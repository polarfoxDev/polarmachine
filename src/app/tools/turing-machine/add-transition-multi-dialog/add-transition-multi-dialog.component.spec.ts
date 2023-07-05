import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransitionMultiDialogComponent } from './add-transition-multi-dialog.component';

describe('AddTransitionMultiDialogComponent', () => {
  let component: AddTransitionMultiDialogComponent;
  let fixture: ComponentFixture<AddTransitionMultiDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTransitionMultiDialogComponent]
    });
    fixture = TestBed.createComponent(AddTransitionMultiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
