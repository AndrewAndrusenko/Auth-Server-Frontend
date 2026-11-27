import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { IUser } from '@core/models/user.models';
import { UserCoreAPIService } from '@core/services/user-core-api.service';
import { StorageService, StorageType } from './storage.service';
import { ICustomLoginError, IJWTInfo, IJWTInfoToken, ILogOut } from '../../features/auth/models/auth.model';
@Injectable({
  providedIn: 'root'
})
export class UserCoreService {
  private appStorage = inject(StorageService).storage(StorageType.IndexDB);
  private userDataSubject = new BehaviorSubject<IJWTInfo>({userId:'logout',role:'none',_id:''})
  private userCoreAPIService = inject(UserCoreAPIService);
  
  get userDataStream$():Observable<IJWTInfo> {return this.userDataSubject.asObservable()}
  get userData():IJWTInfo {return this.userDataSubject.value} 
  
  public setUserData(newUserData:IJWTInfo) {
    this.userDataSubject.next(newUserData)
  }
  
  public loginUser (user:IUser):Observable<ICustomLoginError|IJWTInfoToken|Error> {
    return this.userCoreAPIService.loginUser (user).pipe(
      tap(jwtInfoToken=>(jwtInfoToken as IJWTInfoToken)?.jwtInfo? this.userDataSubject.next((jwtInfoToken as IJWTInfoToken)?.jwtInfo):null),
      switchMap(data => (data as IJWTInfoToken)?.jwtInfo? 
      this.appStorage.setStorageData('jwtInfo',{code:'jwtInfo', data:((data as IJWTInfoToken)?.jwtInfo)}).pipe(map(()=> {return data as IJWTInfoToken}))
      :of(data as IJWTInfoToken))
    )
  }
  logOutUser (user?:IUser):Observable<ILogOut> {
    return of(user).pipe(
      switchMap(user=>user? of(user):this.appStorage.getStorageData('jwtInfo').pipe(map(res=>(res as {data:IUser})?.data||null))),
      filter(user=>user!=null),
      switchMap(user=>this.userCoreAPIService.logOutUser(user)),
      tap(()=>this.userDataSubject.next({userId:'logout',role:'none',_id:''})),
      switchMap(logOut => this.appStorage.deleteStorageData('jwtInfo').pipe(map(()=> {return logOut}))),
    )
  }
}