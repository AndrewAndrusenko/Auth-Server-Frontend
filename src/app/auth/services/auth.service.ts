import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { UserMongoServiceService } from './user-mongo-service.service';
import { ICustomLoginError, ISignUpResult, IUser, SentMessageInfo } from '../types/auth.model';
import { MongoServerError,InsertOneResult, ObjectId } from 'mongodb';
import { APP_HOST } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private userMongoServiceService:UserMongoServiceService) { }

  prepareAndSendEmail(id:ObjectId, token:string,email:string):Observable<SentMessageInfo|ICustomLoginError>{
    let confirmLink =`${APP_HOST}/register/confirm-email/${id}/${token}`
    return this.userMongoServiceService.sendEmailConfirmation(email,confirmLink).pipe(
      catchError((e)=>throwError(()=>{
        console.log('e',e.error?.errorResponse?.message);
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
          switchMap(res=>this.prepareAndSendEmail((res as InsertOneResult).insertedId,userData.token||'',userData.email)),
          switchMap(()=>of(result = {
            type:'success', 
            msg:'User has been signed up.\n Email confimation letter has been sent.', 
            userSigned:true
          })),
          catchError(e=>{
            console.log('e',e);
            return of(result ={type:'error', msg:e, userSigned:e.cause!=='setUser'})
          })
        )
  }
  reSendEmailConfirmation(data:IUser):Observable<SentMessageInfo|ICustomLoginError> {
    return this.userMongoServiceService.updateUser(data).pipe(
      tap(r=>console.log('uopdate',r)),
      switchMap(res=>this.prepareAndSendEmail(data._id,data.token as string,data.email))
    )
    
  }
}
