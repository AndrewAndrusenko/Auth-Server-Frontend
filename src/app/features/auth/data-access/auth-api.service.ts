import { HttpClient } from '@angular/common/http';
import { InsertOneResult, MongoServerError, UpdateResult} from 'mongodb'
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IConfirmMail, ICustomLoginError,  IJWTInfoToken, ILogOut, SentMessageInfo, TMailTypes } from '../models/auth.model';
import { ConfigService } from '../../../core/services/config.service';
import { IUser } from '@core/models/user.models';
@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private configService = inject(ConfigService)
  private http = inject(HttpClient);
  setUser (user:IUser):Observable<InsertOneResult|MongoServerError> {
    return this.http.post<InsertOneResult>(this.configService.config?.REST_ENDPOINT+'users',user)
  }
  setResetPasswordToken (email:string,passwordToken:string):Observable<IUser|MongoServerError> {
    return this.http.post<IUser>(this.configService.config?.REST_ENDPOINT+'users/set_password_token',{email:email,passwordToken:passwordToken})
  };
  setResetPasswordExecute (id:string,passwordToken:string,password:string):Observable<IUser|MongoServerError> {
    return this.http.post<IUser>(this.configService.config?.REST_ENDPOINT+'users/set_new_password',{id:id,token:passwordToken,password:password})
  }

  checkUser (userId:string):Observable<boolean> {
    return this.http.get<boolean>(this.configService.config?.REST_ENDPOINT+'users/checkId',{params:{userId:userId}})
  }
  checkEmail (email:string, exceptCurrent:string):Observable<boolean> {
    return this.http.get<boolean>(this.configService.config?.REST_ENDPOINT+'users/checkEmail',{params:{email:email,except:exceptCurrent}})
  }

  sendEmailConfirmation(emailUser:string,confirmLink:string, typeMsg:TMailTypes):Observable<SentMessageInfo> {
    return this.http.post<SentMessageInfo>(this.configService.config?.REST_ENDPOINT+'mail/send',{emailUser:emailUser,confirmLink:confirmLink,type:typeMsg})
  }
  confirmEmail(params:IConfirmMail):Observable<boolean> {
    return this.http.post<boolean>(this.configService.config?.REST_ENDPOINT+'users/email/confirm',params)
  }
}
