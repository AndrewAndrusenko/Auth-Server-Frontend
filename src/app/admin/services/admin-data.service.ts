import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { REST_ENDPOINT } from '../../environment/environment';
import { IJWTInfoToken, IUser } from '../../auth/models/auth.model';
import { ITokenDeleted, TRefreshTokenTable } from '../models/admin-models';
import { DeleteResult, MongoServerError, UpdateResult } from 'mongodb';
import { UserMongoServiceService } from '../../auth/services/user-mongo-service.service';
export type TTablesNames = 'tokenData'|'userData'
@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  constructor(
    private http:HttpClient,
    private userMongoServiceService:UserMongoServiceService
  ) { }
  reloadTable(table:TTablesNames):Observable<TRefreshTokenTable[]|IUser[]> {
    switch (table) {
      case 'tokenData': return this.getAdminPage()
      case 'userData': return this.getAllUsersData()
    }
  }
  getAllUsersData():Observable<IUser[]> {
    return this.http.get<IUser[]>(REST_ENDPOINT+'admin/all')
  }
  adminUpdateUser(data:IUser):Observable<UpdateResult | MongoServerError> {
    return this.userMongoServiceService.updateUser(data)
  }
  deleteUser(userId:string):Observable<DeleteResult> {
    return this.http.post<DeleteResult>(REST_ENDPOINT+'admin/user-del',{userId:userId})
  }
  getAdminPage():Observable<TRefreshTokenTable[]> {
    return this.http.get<{userId:string,data:IJWTInfoToken}[]>(REST_ENDPOINT+'admin/getAllTokens').pipe(
      map(data=>data.map(el=>{return {...el, ...el.data.jwtInfo, ...el.data,refreshToken:el.data.refreshToken.split('.')[2], action:0} }))
    )
  }
  deleteRefreshToken(data:TRefreshTokenTable):Observable<ITokenDeleted> {
    return this.http.post<ITokenDeleted>(REST_ENDPOINT+'admin/delToken',{userId:data.userId})
  }
}
