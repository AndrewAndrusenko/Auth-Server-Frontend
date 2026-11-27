import { HttpClient } from '@angular/common/http';
import { MongoServerError, UpdateResult} from 'mongodb'
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { IUser } from '../models/user.models';
@Injectable({
  providedIn: 'root'
})
export class UserCoreAPIService {
  private configService = inject(ConfigService)
  private http = inject(HttpClient);
  updateUser (user:IUser):Observable<UpdateResult|MongoServerError> {
    return this.http.post<UpdateResult>(this.configService.config?.REST_ENDPOINT+'users/update',user)
  }
}