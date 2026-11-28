import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIndexedDb } from 'ngx-indexed-db';
import { IndexDBConfig } from './core/models/index-db-conffig';
import { ConfigService } from './core/services/config.service';
import { httpErrorsHandlerInterceptor } from '@core/iterceptors/http-errors-handler.interceptor';
import { withCredentialsInterceptor } from '@core/iterceptors/with-credentials-http.interceptor';
import { provideState, provideStore, Store } from '@ngrx/store';
import { Actions, ofType, provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import * as coreEffects from './core/ngrx/core.effects'
import { coreFeature } from '@core/ngrx/core.reducer';
import { coreActions } from '@core/ngrx/core.actions';
import { take, zip } from 'rxjs';
import { production } from '../environments/environments';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([
      withCredentialsInterceptor,
      httpErrorsHandlerInterceptor
    ])),

    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      const store = inject(Store);
      const action$ = inject(Actions);
      store.dispatch(coreActions.storageGetUserData())
      
      const appInit$ =  zip([
        configService.loadConfigData(),
        action$.pipe(ofType(coreActions.storageGetUserDataSuccess,coreActions.storageGetUserDataFailure))
      ])
      .pipe(take(1));

      return appInit$;
    }),

    provideIndexedDb(IndexDBConfig),
    provideStore(),
    provideState(coreFeature),
    provideEffects(coreEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: production,
      autoPause: true,
      trace: false,
      traceLimit: 75
    })
  ],
};