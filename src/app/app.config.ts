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
import { IndexDBConfig } from './shared/types/index-db-conffig';
import { ConfigService } from './shared/services/config.service';
import { httpErrorsHandlerInterceptor } from '@shared/iterceptors/http-errors-handler.interceptor';
import { withCredentialsInterceptor } from '@shared/iterceptors/with-credentials-http.interceptor';

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