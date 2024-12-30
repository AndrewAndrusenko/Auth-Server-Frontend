import { Injectable } from '@angular/core';
import { HttpRequest,HttpHandler,HttpEvent,HttpInterceptor, HttpErrorResponse} from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SnacksService } from '../services/snacks.service';
import { errorsCode, IErrorCode } from '../types/errors-model';
import { Location } from '@angular/common';

@Injectable()
export class HttpErrorsHandlerInterceptor implements HttpInterceptor {
  constructor (
    private router : Router,
    private snacksService:SnacksService,
    private location:Location
  ) 
  { }
  showError (code:number) {
    let errorOptions = errorsCode.get(code) as IErrorCode
    this.snacksService.openSnackObserve(errorOptions?.message,errorOptions?.buttonName,'error-snackBar').pipe(
      tap(()=>errorOptions?.redirect? this.router.navigate([errorOptions?.route]):null),
      tap(d=>console.log('err',errorOptions)),
      tap(()=>errorOptions?.redirect===false&&errorOptions.route==='back'? this.location.back():null)
    ).subscribe()
  }
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      map(res => {return res}),
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          console.log('This is client side error');
          errorMsg = `Error: ${error.error.message}`;
        } else {
          console.log('This is server side error');
          switch (error.status) {
            case 401:
              this.showError(401)
              break;
              case 403:
              this.showError(403)
            break;
            default:
              error.error.detail? this.snacksService.openSnack('Error:' + error.error.detail.split('\n')[0],'Okay','error-snackBar'): null;
            break;
          }
          errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
        }
        return throwError(() => error)
      })
    )
  }
}
