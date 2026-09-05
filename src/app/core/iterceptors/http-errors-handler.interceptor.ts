import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpHandlerFn,
} from '@angular/common/http';
import { catchError, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SnacksService } from '../../shared/snacks.service';
import { Error_Code, errorsInfo, SERVER_ERRORS } from '../models/errors-model';
import { Location } from '@angular/common';
import { JwtHandlerService } from '../services/jwt-handler.service';

export const httpErrorsHandlerInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const snacksService = inject(SnacksService);
  const location = inject(Location);
  const jwtHandlerService = inject(JwtHandlerService);

  const showError = (code: Error_Code, msg: string | null = ''):Observable<never> => {
    let errorOptions = SERVER_ERRORS.get(code);
    return snacksService
      .openSnackObserve( errorOptions?.message + '\n ' + msg,  errorOptions?.buttonName || 'Ok',    'error-snackBar')
      .pipe(
        tap(() => errorOptions?.redirect? router.navigate([errorOptions?.route]) : null),
        tap(() => errorOptions?.redirect === false && errorOptions.route === 'back' ? location.back() : null),
        switchMap(() => throwError(() => new Error(`Error ${code}) has been handled`))),
      )
  };
  const handleErrorCode = (error: HttpErrorResponse): Observable<never> => {
    switch (error.status) {
      case SERVER_ERRORS.get('AUTHENTICATION_FAILED')!.code:
        return showError('AUTHENTICATION_FAILED', error?.error);
      case SERVER_ERRORS.get('ACCESS_FORBIDEN')!.code:
        return showError('ACCESS_FORBIDEN');
      case 0:
        return showError('SERVICE_UNAVAILABLE');
      default:
        console.log('intercept: unrecognized error code: ', error);
        snacksService.openSnack(
          `Module:${error.error.ml} | Code: ${errorsInfo.get(error.error.msg) || error.error.msg}`,
          'Okay',
          'error-snackBar',
        );
        return throwError(() => error);
    }
  };
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === SERVER_ERRORS.get('JWT_EXPIRED')!.code) {
        jwtHandlerService.refreshTokenSub.next(true);
        return jwtHandlerService.refreshTokenReady.asObservable().pipe(
          take(1),
          switchMap((status) => status === true? next(req) : handleErrorCode(status as HttpErrorResponse)),
        );
      } else {
        return handleErrorCode(error);
      }
    }),
  );
};
