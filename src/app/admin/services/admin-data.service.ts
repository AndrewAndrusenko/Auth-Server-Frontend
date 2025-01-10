import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { REST_ENDPOINT } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {

  constructor(
    private http:HttpClient
  ) { }
  getAdminPage():Observable<string> {
    return this.http.get<{data:string}>(REST_ENDPOINT+'admin').pipe(map(res=>res.data))
  }
}
