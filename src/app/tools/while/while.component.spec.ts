import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhileComponent } from './while.component';

describe('WhileComponent', () => {
  let component: WhileComponent;
  let fixture: ComponentFixture<WhileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WhileComponent]
    });
    fixture = TestBed.createComponent(WhileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
