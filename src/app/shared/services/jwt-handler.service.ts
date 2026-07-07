import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, exhaustMap, map, Observable, Subject, tap, throwError } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class JwtHandlerService {
  public refreshTokenSub:Subject<boolean> = new Subject()
  public refreshTokenReady:Subject<boolean> = new Subject();
  private configService = inject(ConfigService)
  constructor(private http:HttpClient) { 
    this.refreshTokenSub.pipe(
      exhaustMap(()=>this.refreshToken()),
    ).subscribe(()=>this.refreshTokenReady.next(true))
  }

  refreshToken():Observable<boolean|Error> {
    return this.http.get<boolean>(this.configService.config?.REST_ENDPOINT+'users/refresh').pipe(
      map(()=>true),
      catchError(err=>{
        console.log('catchError refreshToken',err )
        return throwError(()=>err)
      })
    )
  }
}
