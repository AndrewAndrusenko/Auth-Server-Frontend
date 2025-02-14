import { TestBed } from '@angular/core/testing';

import { JwtHandlerService } from './jwt-handler.service';

describe('JwtHandlerService', () => {
  let service: JwtHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
