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
  const showError = (code: Error_Code, msg: string | null = '') => {
    let errorOptions = SERVER_ERRORS.get(code);
    snacksService
      .openSnackObserve(
        errorOptions?.message + '\n ' + msg,
        errorOptions?.buttonName || 'Ok',
        'error-snackBar',
      )
      .pipe(
        tap(() =>
          errorOptions?.redirect
            ? router.navigate([errorOptions?.route])
            : null,
        ),
        tap(() =>
          errorOptions?.redirect === false && errorOptions.route === 'back'
            ? location.back()
            : null,
        ),
      )
      .subscribe();
  };
  const handleErrorCode = (error: HttpErrorResponse): number => {
    switch (error.status) {
      case SERVER_ERRORS.get('AUTHENTICATION_FAILED')!.code:
        showError('AUTHENTICATION_FAILED', error?.error);
        // this.authService.logOutUser().subscribe() //remove??
        break;
      case SERVER_ERRORS.get('ACCESS_FORBIDEN')!.code:
        showError('ACCESS_FORBIDEN');
        break;
      case 0:
        showError('SERVICE_UNAVAILABLE');
        break;
      default:
        console.log('intercept: unrecognized error code: ', error);
        snacksService.openSnack(
          `Module:${error.error.ml} | Code: ${errorsInfo.get(error.error.msg) || error.error.msg}`,
          'Okay',
          'error-snackBar',
        );
        break;
    }
    return error.status || 0;
  };
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === SERVER_ERRORS.get('JWT_EXPIRED')!.code) {
        jwtHandlerService.refreshTokenSub.next(true);
        return jwtHandlerService.refreshTokenReady.asObservable().pipe(
          take(1),
          switchMap((status) => {
            if (status === true) {
              return next(req);
            } else {
              handleErrorCode(status as HttpErrorResponse);
              return throwError(() => status);
            }
          }),
        );
      } else {
        handleErrorCode(error);
        return throwError(() => error);
      }
    }),
  );
};
