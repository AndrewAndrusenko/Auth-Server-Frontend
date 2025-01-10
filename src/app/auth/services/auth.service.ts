import { Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, of, scan, switchMap, takeWhile, tap, throwError, timer } from 'rxjs';
import { UserMongoServiceService } from './user-mongo-service.service';
import { ICustomLoginError, ISignUpResult, IUser, SentMessageInfo } from '../types/auth.model';
import { MongoServerError,InsertOneResult, ObjectId } from 'mongodb';
import { AppStorage, StorageService, StorageType } from '../../shared/services/storage.service';
import { RESET_PASSWORD_TIMEOUT } from '../../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private appStorage:AppStorage;
  public timer$: Observable<number>;

  constructor(
    private userMongoServiceService:UserMongoServiceService,
    private storageService:StorageService
  ) {
    this.appStorage = this.storageService.initStorageObj(StorageType.IndexDB);
    this.timer$ = of(0)
  }
  prepareAndSendEmail(id:ObjectId, token:string,email:string, route:string):Observable<SentMessageInfo|ICustomLoginError>{
    let confirmLink =`${window.location.href}/${route}${id}/${token}`
    return this.userMongoServiceService.sendEmailConfirmation(email,confirmLink).pipe(
      catchError(e =>throwError(()=>{
        console.log('error',e.error?.errorResponse?.message);
        return new Error(e.error?.errorResponse?.message,{cause:'sendEmail'})}))
    )
  }
  singUpUser(userData:IUser):Observable<ISignUpResult> {
    let result:ISignUpResult
    let token=crypto.randomUUID()
    return this.userMongoServiceService.setUser ({...userData,token:token}).pipe(
      switchMap(res=> {
        return  (Object.hasOwn(res,'errorResponse'))? throwError(()=>{return new Error ((res as MongoServerError).errorResponse.errmsg||'',{cause:'setUser'})}): of(res)
      }),
      switchMap(res=>this.prepareAndSendEmail((res as InsertOneResult).insertedId,token,userData.email,'confirm-email/')),
      switchMap(()=>of(result = {
        type:'success', 
        msg:'User has been signed up.\n Email confimation letter has been sent.', 
        userSigned:true
      })),
      catchError(e=>{
        console.log('error',e);
        return of(result ={type:'error', msg:e, userSigned:e.cause!=='setUser'})
      })
    )
  }
  reSendEmailConfirmation(data:IUser):Observable<SentMessageInfo|ICustomLoginError> {
    return this.userMongoServiceService.updateUser(data)
      .pipe(switchMap(()=>this.prepareAndSendEmail(data._id,data.token as string,data.email,'confirm-email/')))
  }
  resetPasswordEmail(email:string):Observable<SentMessageInfo|ICustomLoginError> {
    return this.userMongoServiceService.setResetPasswordToken(email,crypto.randomUUID()).pipe(
      switchMap((user)=>this.prepareAndSendEmail(user._id, user.passwordToken, user.email,'').pipe(switchMap(()=>of(user)))),
      switchMap(()=> this.appStorage.setStorageData('',{code:'emailSent', data: Number(new Date())})),
    )
  }
  resetPasswordExecute(id:string,token:string,password:string):Observable<any> {
    return this.userMongoServiceService.setResetPasswordExecute(id,token,password)
    .pipe(
      catchError(e=>{
        console.log('error',e )
        return EMPTY
      }))
  }
  setTimerForResend (time:number) {
    this.timer$ = timer(0,1000).pipe(
      scan(acc=>--acc,time),
      takeWhile(x =>x >=0)
    )
  }
  checkTimer() {
    this.appStorage.getStorageData('emailSent').subscribe(date=>{
      let lastTimeSent = date as {code:string, data: number};
      let timerRest = RESET_PASSWORD_TIMEOUT - Math.floor((Number(new Date()) - lastTimeSent.data)/1000)  
      timerRest>0? this.setTimerForResend(timerRest) : null;
    })
  }
}
