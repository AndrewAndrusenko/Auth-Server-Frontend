import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { IndexDBConfig } from './shared/types/index-db-conffig';
import { AuthInterceptor } from './shared/iterceptors/http-interceptor.interceptor';
import { HttpErrorsHandlerInterceptor } from './shared/iterceptors/http-errors-handler.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [ 
    importProvidersFrom (RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload' })),
    importProvidersFrom (NgxIndexedDBModule.forRoot(IndexDBConfig) ),
    provideAnimations(), 
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(appRoutes), 
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {provide:HTTP_INTERCEPTORS,
      useClass:AuthInterceptor,
      multi:true
    },
    {provide:HTTP_INTERCEPTORS,
      useClass:HttpErrorsHandlerInterceptor,
      multi:true
    }    
  ]
};
