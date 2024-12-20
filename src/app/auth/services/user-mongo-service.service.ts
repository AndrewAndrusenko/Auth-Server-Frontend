import { HttpClient } from '@angular/common/http';
import { InsertOneResult, MongoServerError, UpdateResult} from 'mongodb'
import { Injectable } from '@angular/core';
import { Observable,map, of } from 'rxjs';
import { REST_ENDPOINT } from '../../environment/environment';
import { IConfirmMail, ICustomLoginError, IUser, SentMessageInfo } from '../types/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserMongoServiceService {
  constructor(private http:HttpClient) { }
  setUser (user:IUser):Observable<InsertOneResult|MongoServerError> {
    return this.http.post<InsertOneResult>(REST_ENDPOINT+'users',user)
  }
  updateUser (user:IUser):Observable<UpdateResult|MongoServerError> {
    return this.http.post<UpdateResult>(REST_ENDPOINT+'users/update',user)
  }
  loginUser (user:IUser):Observable<ICustomLoginError> {
    return this.http.post<ICustomLoginError>(REST_ENDPOINT+'users/login',user)
  }
  checkUser (userId:string):Observable<boolean> {
    return this.http.get<boolean>(REST_ENDPOINT+'users/checkId',{params:{userId:userId}})
  }
  checkEmail (email:string, exceptCurrent:string):Observable<boolean> {
    return this.http.get<boolean>(REST_ENDPOINT+'users/checkEmail',{params:{email:email,except:exceptCurrent}})
  }

  sendEmailConfirmation(emailUser:string,confirmLink:string):Observable<SentMessageInfo> {
    return this.http.post<SentMessageInfo>(REST_ENDPOINT+'mail/send',{emailUser:emailUser,confirmLink:confirmLink})
  }
  confirmEmail(params:IConfirmMail):Observable<boolean> {
    return this.http.post<boolean>(REST_ENDPOINT+'users/email/confirm',params)
  }

}
