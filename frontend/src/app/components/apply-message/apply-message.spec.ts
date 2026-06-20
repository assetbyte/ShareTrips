import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyMessage } from './apply-message';

describe('ApplyMessage', () => {
  let component: ApplyMessage;
  let fixture: ComponentFixture<ApplyMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyMessage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
