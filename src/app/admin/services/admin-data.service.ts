import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { REST_ENDPOINT } from '../../environment/environment';
import { IJWTInfoToken } from '../../auth/models/auth.model';
import { ITokenDeleted, TRefreshTokenTable } from '../models/admin-models';
@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  constructor(private http:HttpClient) { }
  reloadTable():Observable<TRefreshTokenTable[]> {
    return this.getAdminPage()
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
