import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoopComponent } from './loop.component';

describe('LoopComponent', () => {
  let component: LoopComponent;
  let fixture: ComponentFixture<LoopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoopComponent]
    });
    fixture = TestBed.createComponent(LoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
