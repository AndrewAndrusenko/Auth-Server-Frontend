import { HttpClient } from '@angular/common/http';
import { InsertOneResult, MongoServerError, UpdateResult} from 'mongodb'
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IConfirmMail, ICustomLoginError,  IJWTInfoToken, ILogOut, IUser, SentMessageInfo, TMailTypes } from '../models/auth.model';
import { ConfigService } from '../../shared/services/config.service';

@Injectable({
  providedIn: 'root'
})
export class UserMongoServiceService {
  private REST_ENDPOINT = inject(ConfigService).config?.REST_ENDPOINT
  constructor(
    private http:HttpClient,
  ) {}
  setUser (user:IUser):Observable<InsertOneResult|MongoServerError> {
    return this.http.post<InsertOneResult>(this.REST_ENDPOINT+'users',user)
  }
  updateUser (user:IUser):Observable<UpdateResult|MongoServerError> {
    return this.http.post<UpdateResult>(this.REST_ENDPOINT+'users/update',user)
  }
  setResetPasswordToken (email:string,passwordToken:string):Observable<IUser|MongoServerError> {
    return this.http.post<IUser>(this.REST_ENDPOINT+'users/set_password_token',{email:email,passwordToken:passwordToken})
  };
  setResetPasswordExecute (id:string,passwordToken:string,password:string):Observable<IUser|MongoServerError> {
    return this.http.post<IUser>(this.REST_ENDPOINT+'users/set_new_password',{id:id,token:passwordToken,password:password})
  }
  logOutUser (user:IUser):Observable<ILogOut> {
    return this.http.post<ILogOut>(this.REST_ENDPOINT+'users/logout',user)
  }
  loginUser (user:IUser):Observable<ICustomLoginError|IJWTInfoToken|Error> {
    return this.http.post<ICustomLoginError|IJWTInfoToken>(this.REST_ENDPOINT+'users/login',user)
  }
  checkUser (userId:string):Observable<boolean> {
    return this.http.get<boolean>(this.REST_ENDPOINT+'users/checkId',{params:{userId:userId}})
  }
  checkEmail (email:string, exceptCurrent:string):Observable<boolean> {
    return this.http.get<boolean>(this.REST_ENDPOINT+'users/checkEmail',{params:{email:email,except:exceptCurrent}})
  }

  sendEmailConfirmation(emailUser:string,confirmLink:string, typeMsg:TMailTypes):Observable<SentMessageInfo> {
    return this.http.post<SentMessageInfo>(this.REST_ENDPOINT+'mail/send',{emailUser:emailUser,confirmLink:confirmLink,type:typeMsg})
  }
  confirmEmail(params:IConfirmMail):Observable<boolean> {
    return this.http.post<boolean>(this.REST_ENDPOINT+'users/email/confirm',params)
  }

}
