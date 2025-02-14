import { Injectable } from '@angular/core';
import { HttpRequest,HttpHandler,HttpEvent,HttpInterceptor, HttpErrorResponse} from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SnacksService } from '../services/snacks.service';
import { Error_Code, errorsInfo, SERVER_ERRORS } from '../types/errors-model';
import { Location } from '@angular/common';
import { JwtHandlerService } from '../services/jwt-handler.service';

@Injectable()
export class HttpErrorsHandlerInterceptor implements HttpInterceptor {
  constructor (
    private router : Router,
    private snacksService:SnacksService,
    private location:Location,
    private jwtHandlerService:JwtHandlerService
  ) 
  { }
  showError (code:Error_Code, msg:string|null='') {
    let errorOptions = SERVER_ERRORS.get(code)
    this.snacksService.openSnackObserve(errorOptions?.message+'\n '+msg,errorOptions?.buttonName||'Ok','error-snackBar').pipe(
      tap(()=>errorOptions?.redirect? this.router.navigate([errorOptions?.route]):null),
      tap(()=>errorOptions?.redirect===false&&errorOptions.route==='back'? this.location.back():null)
    ).subscribe()
  }
  handleErrorCode(error:HttpErrorResponse):number {
    switch (error.status) {
      case SERVER_ERRORS.get('AUTHENTICATION_FAILED')!.code:
        this.showError('AUTHENTICATION_FAILED',error?.error);
        // this.authService.logOutUser().subscribe() //remove??
      break;
      case SERVER_ERRORS.get('ACCESS_FORBIDEN')!.code:
        this.showError('ACCESS_FORBIDEN');
      break;
      case 0:
        this.showError('SERVICE_UNAVAILABLE')
      break;
      default:
        console.log('intercept: unrecognized error code: ',error )
        this.snacksService.openSnack(`Module:${error.error.ml} | Code: ${errorsInfo.get(error.error.msg)||error.error.msg}`,'Okay','error-snackBar');
      break;
    }
    return error.status||0
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      map(res => {return res}),
      catchError((error: HttpErrorResponse) => {
        return of(error.status).pipe(
          switchMap(code=> {
            if (code === SERVER_ERRORS.get('JWT_EXPIRED')!.code) {
              this.jwtHandlerService.refreshTokenSub.next(true)
              return this.jwtHandlerService.refreshTokenReady.asObservable().pipe(
                take(1),
                switchMap(()=> of(request)),
              )
            } else {
              return of(this.handleErrorCode(error))
            } 
          }),
          switchMap(result=> result instanceof(HttpRequest)? this.intercept(request,next) : throwError(()=>error))
        )
      })
    )
  }
}