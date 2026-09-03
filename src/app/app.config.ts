import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { IndexDBConfig } from './core/models/index-db-conffig';
import { ConfigService } from './core/services/config.service';
import { httpErrorsHandlerInterceptor } from '@core/iterceptors/http-errors-handler.interceptor';
import { withCredentialsInterceptor } from '@core/iterceptors/with-credentials-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(NgxIndexedDBModule.forRoot(IndexDBConfig)),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([
      withCredentialsInterceptor,
      httpErrorsHandlerInterceptor
    ])),
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      return configService.loadConfigData();
    }),
  ],
};