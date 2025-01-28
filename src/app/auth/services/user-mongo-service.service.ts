import { HttpClient } from '@angular/common/http';
import { InsertOneResult, MongoServerError, UpdateResult} from 'mongodb'
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { REST_ENDPOINT } from '../../environment/environment';
import { IConfirmMail, ICustomLoginError,  IJWTInfoToken, ILogOut, IUser, SentMessageInfo, TMailTypes } from '../models/auth.model';
import { AppStorage, StorageService,StorageType } from '../../shared/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserMongoServiceService {
  private appStorage:AppStorage;
  
  constructor(
    private http:HttpClient,
    private storageService:StorageService
  ) { 
    this.appStorage = storageService.initStorageObj(StorageType.Seesiion)
  }
  setUser (user:IUser):Observable<InsertOneResult|MongoServerError> {
    return this.http.post<InsertOneResult>(REST_ENDPOINT+'users',user)
  }
  updateUser (user:IUser):Observable<UpdateResult|MongoServerError> {
    return this.http.post<UpdateResult>(REST_ENDPOINT+'users/update',user)
  }
  setResetPasswordToken (email:string,passwordToken:string):Observable<IUser|MongoServerError> {
    return this.http.post<IUser>(REST_ENDPOINT+'users/set_password_token',{email:email,passwordToken:passwordToken})
  };
  setResetPasswordExecute (id:string,passwordToken:string,password:string):Observable<IUser|MongoServerError> {
    return this.http.post<IUser>(REST_ENDPOINT+'users/set_new_password',{id:id,token:passwordToken,password:password})
  }
  logOutUser (user:IUser):Observable<ILogOut> {
    return this.http.post<ILogOut>(REST_ENDPOINT+'users/logout',user)
  }
  loginUser (user:IUser):Observable<ICustomLoginError|IJWTInfoToken|Error> {
    return this.http.post<ICustomLoginError|IJWTInfoToken>(REST_ENDPOINT+'users/login',user)
  }
  checkUser (userId:string):Observable<boolean> {
    return this.http.get<boolean>(REST_ENDPOINT+'users/checkId',{params:{userId:userId}})
  }
  checkEmail (email:string, exceptCurrent:string):Observable<boolean> {
    return this.http.get<boolean>(REST_ENDPOINT+'users/checkEmail',{params:{email:email,except:exceptCurrent}})
  }

  sendEmailConfirmation(emailUser:string,confirmLink:string, typeMsg:TMailTypes):Observable<SentMessageInfo> {
    return this.http.post<SentMessageInfo>(REST_ENDPOINT+'mail/send',{emailUser:emailUser,confirmLink:confirmLink,type:typeMsg})
  }
  confirmEmail(params:IConfirmMail):Observable<boolean> {
    return this.http.post<boolean>(REST_ENDPOINT+'users/email/confirm',params)
  }

}
