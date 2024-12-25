import { TestBed } from '@angular/core/testing';

import { HttpErrorsHandlerInterceptor } from './http-errors-handler.interceptor';

describe('HttpErrorsHandlerInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      HttpErrorsHandlerInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: HttpErrorsHandlerInterceptor = TestBed.inject(HttpErrorsHandlerInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
