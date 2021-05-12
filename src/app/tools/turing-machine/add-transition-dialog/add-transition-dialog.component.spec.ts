import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransitionDialogComponent } from './add-transition-dialog.component';

describe('AddTransitionDialogComponent', () => {
  let component: AddTransitionDialogComponent;
  let fixture: ComponentFixture<AddTransitionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTransitionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTransitionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
