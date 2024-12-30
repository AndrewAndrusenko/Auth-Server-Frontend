import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AppStorage, StorageService, StorageType } from '../services/storage.service';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, of, switchMap } from 'rxjs';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private appStorage: AppStorage
  constructor(
    private storageService:StorageService,
  ) {
    this.appStorage = this.storageService.initStorageObj(StorageType.Seesiion)
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.appStorage.getStorageData('jwt').pipe(
      switchMap(token=> token?  of(req.clone({headers: req.headers.set('Authorization', `Bearer ${(token as string).replaceAll('"','')}`)})) : of(req)),
      switchMap(req=>{return next.handle(req)}),
      catchError(e=>{
        console.log('error',e);
        return EMPTY
      })
    )
  }
}
