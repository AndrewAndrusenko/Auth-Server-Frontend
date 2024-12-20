import { TestBed } from '@angular/core/testing';

import { UserMongoServiceService } from './user-mongo-service.service';

describe('UserMongoServiceService', () => {
  let service: UserMongoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserMongoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
