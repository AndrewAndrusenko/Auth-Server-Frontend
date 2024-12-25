import { Injectable } from '@angular/core';
import { HttpRequest,HttpHandler,HttpEvent,HttpInterceptor, HttpErrorResponse} from '@angular/common/http';
import { catchError,  debounce,  delay,  map, Observable, Subject, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpErrorsHandlerInterceptor implements HttpInterceptor {

  private errorPipe = new Subject <any>
  constructor(
  private snack:MatSnackBar,
  private router : Router
  ) { 
    this.errorPipe.pipe (
      switchMap(()=>
        this.snack.open('Your session is not authenticated.\n You have to Log In again','Go to login',{
        panelClass:['error-snackBar'],
        horizontalPosition:'center',
        verticalPosition:'bottom',
      }).onAction()),
      tap(()=>this.router.navigate(['register']))
      ).subscribe()
   }
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      map(res => {
          return res
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          console.log('This is client side error');
          errorMsg = `Error: ${error.error.message}`;
        } else {
          console.log('This is server side error');
          switch (error.status) {
            case 401:
              this.errorPipe.next(true)
            break;
            case 403:
              this.errorPipe.next(true)
            break;
            default:
              console.log('default',);
              error.error.detail? this.snack.open('Error:' + error.error.detail.split('\n')[0],'Okay',{
                panelClass:['error-snackBar'],
                horizontalPosition:'center',
                verticalPosition:'bottom',
              }) : null;
            break;
          }
          errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
        }
        return throwError(() => error)
      })
    )
  }
}
