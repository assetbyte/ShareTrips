import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureTrips } from './future-trips';

describe('FutureTrips', () => {
  let component: FutureTrips;
  let fixture: ComponentFixture<FutureTrips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FutureTrips]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FutureTrips);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
