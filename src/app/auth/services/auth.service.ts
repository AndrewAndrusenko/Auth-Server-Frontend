import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, filter, map, Observable, of, scan, switchMap, takeWhile, tap, throwError, timer } from 'rxjs';
import { UserMongoServiceService } from './user-mongo-service.service';
import { ICustomLoginError, IJWTInfo, IJWTInfoToken, ILogOut, ISignUpResult, IUser, SentMessageInfo, TMailTypes } from '../models/auth.model';
import { MongoServerError,InsertOneResult, ObjectId } from 'mongodb';
import { AppStorage, StorageService, StorageType } from '../../shared/services/storage.service';
import { RESET_PASSWORD_TIMEOUT } from '../../environment/environment';
import { IErrorUI } from '../../shared/types/errors-model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private appStorage:AppStorage;
  public timer$: Observable<number>;
  public userDataSubject = new BehaviorSubject<IJWTInfo>({userId:'logout',role:'',_id:''})

  constructor(
    private userMongoServiceService:UserMongoServiceService,
    private storageService:StorageService
  ) {
    this.appStorage = this.storageService.initStorageObj(StorageType.IndexDB);
    this.timer$ = of(0)
  }
  loginUser (user:IUser):Observable<ICustomLoginError|IJWTInfoToken|Error> {
    return this.userMongoServiceService.loginUser (user).pipe(
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
      switchMap(user=>this.userMongoServiceService.logOutUser(user)),
      tap(()=>this.userDataSubject.next({userId:'logout',role:'',_id:''})),
      switchMap(logOut => this.appStorage.clearStorageData('jwtInfo').pipe(map(()=> {return logOut}))),
    )
  }
  singUpUser(userData:IUser):Observable<ISignUpResult> {
    let result:ISignUpResult
    let token=crypto.randomUUID()
    return this.userMongoServiceService.setUser ({...userData,token:token}).pipe(
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
    return this.userMongoServiceService.sendEmailConfirmation(email,confirmLink,typeMsg).pipe(
      catchError(err =>{
        console.log('error',err);
        err.cause = 'sendEmail'
        return throwError(()=>err);
      }))
  }
  reSendEmailConfirmation(data:IUser):Observable<SentMessageInfo|ICustomLoginError> {
    return this.userMongoServiceService.updateUser(data)
      .pipe(switchMap(()=>this.prepareAndSendEmail(data._id,data.token as string,data.email,'confirm-email/','emailConfirmationMail')))
  }
  resetPasswordEmail(email:string):Observable<SentMessageInfo|ICustomLoginError> {
    return this.userMongoServiceService.setResetPasswordToken(email,crypto.randomUUID()).pipe(
      switchMap((user)=>this.prepareAndSendEmail(user._id, user.passwordToken, user.email,'','PasswordRestMail').pipe(switchMap(()=>of(user)))),
      switchMap(()=> this.appStorage.setStorageData('',{code:'emailSent', data: Number(new Date())})),
    )
  }
  resetPasswordExecute(id:string,token:string,password:string):Observable<any> {
    return this.userMongoServiceService.setResetPasswordExecute(id,token,password)
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
      let lastTimeSent = date as {code:string, data: number};
      let timerRest = RESET_PASSWORD_TIMEOUT - Math.floor((Number(new Date()) - lastTimeSent.data)/1000)  
      timerRest>0? this.setTimerForResend(timerRest) : null;
    })
  }
    reloadTable():Observable<{}[]> { //just for test could be deleted
      return of([''])
    }
}
