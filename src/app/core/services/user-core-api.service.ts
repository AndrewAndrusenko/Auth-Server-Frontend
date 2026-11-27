import { HttpClient } from '@angular/common/http';
import { MongoServerError, UpdateResult} from 'mongodb'
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { IUser } from '../models/user.models';
import { ICustomLoginError, IJWTInfoToken, ILogOut } from '../../features/auth/models/auth.model';
@Injectable({
  providedIn: 'root'
})
export class UserCoreAPIService {
  private configService = inject(ConfigService)
  private http = inject(HttpClient);

  loginUser (user:IUser):Observable<ICustomLoginError|IJWTInfoToken|Error> {
    return this.http.post<ICustomLoginError|IJWTInfoToken>(this.configService.config?.REST_ENDPOINT+'users/login',user)
  }

  logOutUser (user:IUser):Observable<ILogOut> {
    return this.http.post<ILogOut>(this.configService.config?.REST_ENDPOINT+'users/logout',user)
  }
  
  updateUser (user:IUser):Observable<UpdateResult|MongoServerError> {
    return this.http.post<UpdateResult>(this.configService.config?.REST_ENDPOINT+'users/update',user)
  }
}