import { HttpClient } from '@angular/common/http';
import { InsertOneResult, MongoServerError, UpdateResult} from 'mongodb'
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { REST_ENDPOINT } from '../../environment/environment';
import { IConfirmMail, ICustomLoginError, IJWT, IUser, SentMessageInfo } from '../types/auth.model';
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
  loginUser (user:IUser):Observable<ICustomLoginError|IJWT|Error> {
    console.log('log',);
    return this.http.post<ICustomLoginError|IJWT>(REST_ENDPOINT+'users/login',user).pipe(
      switchMap(data => (data as IJWT)?.jwt? this.appStorage.setStorageData('jwt', (data as IJWT)?.jwt).pipe(
        map(res=> {return {...data as IJWT,saved:res as boolean}})
      ):of({...data as IJWT,saved:false}))
    )
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
