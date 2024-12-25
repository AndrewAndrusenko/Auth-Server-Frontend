import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { REST_ENDPOINT } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {

  constructor(private http:HttpClient) { }
  getQuotes ():Observable<string> {
    return this.http.get<string>(REST_ENDPOINT + 'quote')
  }
}
