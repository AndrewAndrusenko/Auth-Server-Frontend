import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IJWTInfoToken } from '../../auth/models/auth.model';
import { ITokenDeleted, TRefreshTokenTable } from '../models/admin-models';
import { DeleteResult, MongoServerError, UpdateResult } from 'mongodb';
import { ConfigService } from '../../../core/services/config.service';
import { UserCoreAPIService } from '@core/services/user-core-api.service';
import { IUser } from '@core/models/user.models';
export type TTablesNames = 'tokenData'|'userData'
@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
    private REST_ENDPOINT = inject(ConfigService).config?.REST_ENDPOINT
    private http = inject(HttpClient)
    private userCoreAPIService = inject(UserCoreAPIService)
  reloadTable(table:TTablesNames):Observable<TRefreshTokenTable[]|IUser[]> {
    switch (table) {
      case 'tokenData': return this.getAdminPage()
      case 'userData': return this.getAllUsersData()
    }
  }
  getAllUsersData():Observable<IUser[]> {
    return this.http.get<IUser[]>(this.REST_ENDPOINT+'admin/all')
  }
  adminUpdateUser(data:IUser):Observable<UpdateResult | MongoServerError> {
    return this.userCoreAPIService.updateUser(data)
  }
  deleteUser(userId:string):Observable<DeleteResult> {
    return this.http.post<DeleteResult>(this.REST_ENDPOINT+'admin/user-del',{userId:userId})
  }
  getAdminPage():Observable<TRefreshTokenTable[]> {
    return this.http.get<{userId:string,data:IJWTInfoToken}[]>(this.REST_ENDPOINT+'admin/getAllTokens').pipe(
      map(data=>data.map(el=>{return {...el, ...el.data.jwtInfo, ...el.data,refreshToken:el.data.refreshToken.split('.')[2], action:0} }))
    )
  }
  deleteRefreshToken(data:TRefreshTokenTable):Observable<ITokenDeleted> {
    return this.http.post<ITokenDeleted>(this.REST_ENDPOINT+'admin/delToken',{userId:data.userId})
  }
}
