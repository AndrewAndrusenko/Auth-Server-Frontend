import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, take, tap, throwError } from "rxjs";
import { ENVIRONMENT } from "../../environment/environment";
interface IConfing {
    "SUCCESS_TIME_OUT": number,
    "RESET_PASSWORD_TIMEOUT": number,
    "REST_ENDPOINT": string,
    "APP_HOST": string
}
@Injectable ({
    providedIn:'root'
})
export class ConfigService {
    private http = inject(HttpClient)
    private configData:IConfing|undefined = undefined
    loadConfigData():Observable<boolean> {
        return this.http.get<IConfing>( ENVIRONMENT.prod? 'env.config.prod.json' : 'env.config.json').pipe(
            take(1),
            tap(data=>this.configData = data),
            map(()=>true),
            catchError(err=>{
                console.log('Loading config file error',err )
                const appRoot = document.querySelector('app-root');
                if (appRoot) {
                    appRoot.innerHTML = `
                    <div style="font-family: sans-serif; padding: 20px; text-align: center; margin-top: 50px;">
                        <h2 style="color: #dc3545;">Error with launching application</h2>
                        <p>The config file could not be loaded</p>
                    </div>
                    `;
                }
                return throwError(()=> err)
            })
        )
    }
    get config():IConfing|undefined { return this.configData}
}