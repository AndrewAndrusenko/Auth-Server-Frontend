import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../../shared/services/config.service';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  private http = inject(HttpClient) 
  private configService = inject(ConfigService)
  getQuotes ():Observable<{data:string}> {
    return this.http.get<{data:string}>(this.configService.config?.REST_ENDPOINT + 'quote')
  }
}
