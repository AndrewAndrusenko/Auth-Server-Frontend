import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  exhaustMap,
  map,
  Observable,
  of,
  Subject,
  throwError,
} from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class JwtHandlerService {
  public refreshTokenSub: Subject<boolean> = new Subject();
  public refreshTokenReady: Subject<boolean | HttpErrorResponse> =  new Subject();
  private configService = inject(ConfigService);
  private http = inject(HttpClient);
  constructor() {
    this.refreshTokenSub
      .pipe(
        exhaustMap(() => this.refreshToken()),
        catchError((err: HttpErrorResponse) => of(err)),
      )
      .subscribe(() => this.refreshTokenReady.next(true));
  }

  refreshToken(): Observable<boolean | Error> {
    return this.http
      .get<boolean>(this.configService.config?.REST_ENDPOINT + 'users/refresh')
      .pipe(
        map(() => true),
        catchError((err) => {
          console.log('catchError refreshToken', err);
          return throwError(() => err);
        }),
      );
  }
}
