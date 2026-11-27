import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, scan, switchMap, takeWhile, throwError, timer } from 'rxjs';
import { ICustomLoginError, ISignUpResult, SentMessageInfo, TMailTypes } from '../models/auth.model';
import { InsertOneResult, ObjectId } from 'mongodb';
import { StorageService, StorageType } from '../../../core/services/storage.service';
import { IErrorUI } from '../../../core/models/errors-model';
import { ConfigService } from '../../../core/services/config.service';
import { AuthApiService } from './auth-api.service';
import { IUser } from '@core/models/user.models';
import { UserCoreAPIService } from '@core/services/user-core-api.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public timer$: Observable<number> = of(0);
  private authApiService = inject(AuthApiService);
  private userCoreAPIService = inject(UserCoreAPIService);
  private appStorage = inject(StorageService).storage(StorageType.IndexDB);

  singUpUser(userData:IUser):Observable<ISignUpResult> {
    let result:ISignUpResult
    let token=crypto.randomUUID()
    return this.authApiService.setUser ({...userData,token:token}).pipe(
      switchMap(res=>this.prepareAndSendEmail((res as InsertOneResult).insertedId,token,userData.email,'confirm-email/','emailConfirmationMail')),
      switchMap(()=>of(result = {
        type:'success', 
        msg:'User has been signed up.\n Email confimation letter has been sent.', 
        userSigned:true
      })),
      catchError(err=>{
        let errUI = err.error as IErrorUI
        return of(result ={type:'error', msg:`${err.error.ml} : ${err.error.msg}`, userSigned:errUI.ml==='MailService'})
      })
    )
  }

  prepareAndSendEmail(id:ObjectId, token:string,email:string, route:string, typeMsg:TMailTypes):Observable<SentMessageInfo|ICustomLoginError>{
    let confirmLink =`${window.location.href}/${route}${id}/${token}`
    return this.authApiService.sendEmailConfirmation(email,confirmLink,typeMsg).pipe(
      catchError(err =>{
        console.log('error',err);
        err.cause = 'sendEmail'
        return throwError(()=>err);
      }))
  }

  reSendEmailConfirmation(data:IUser):Observable<SentMessageInfo|ICustomLoginError> {
    return this.userCoreAPIService.updateUser(data)
      .pipe(switchMap(()=>this.prepareAndSendEmail(data._id,data.token as string,data.email,'confirm-email/','emailConfirmationMail')))
  }

  resetPasswordEmail(email:string):Observable<SentMessageInfo|ICustomLoginError> {
    return this.authApiService.setResetPasswordToken(email,crypto.randomUUID()).pipe(
      switchMap((user)=>this.prepareAndSendEmail(user._id, user.passwordToken, user.email,'','PasswordRestMail').pipe(switchMap(()=>of(user)))),
      switchMap(()=> this.appStorage.setStorageData('',{code:'emailSent', data: Number(new Date())})),
    )
  }

  resetPasswordExecute(id:string,token:string,password:string):Observable<any> {
    return this.authApiService.setResetPasswordExecute(id,token,password)
    .pipe(
      catchError(err=>{
        console.log('error',err )
        return throwError(()=>err)
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
      const RESET_PASSWORD_TIMEOUT = inject(ConfigService).config?.RESET_PASSWORD_TIMEOUT || 10
      const lastTimeSent = date as {code:string, data: number};
      let timerRest = RESET_PASSWORD_TIMEOUT - Math.floor((Number(new Date()) - lastTimeSent.data)/1000)  
      timerRest>0? this.setTimerForResend(timerRest) : null;
    })
  }

  reloadTable():Observable<{}[]> { //just for test could be deleted
    return of([''])
  }
}