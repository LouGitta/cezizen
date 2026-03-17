import { TestBed } from '@angular/core/testing';

import { BreathingServices } from './breathing-services';

describe('BreathingServices', () => {
  let service: BreathingServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreathingServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
