import { Routes } from '@angular/router';

export const appRoutes: Routes = [] = [
  {
    path:'register',
    loadChildren: ()=>import('./auth/auth.routes').then(m=>m.registerRoutes) //Lazy loading
  },
  {
    path:'quotes',
    loadChildren: ()=>import('./quotes-table/quotes.routes').then(m=>m.quotesTableRouter) //Lazy loading
  }
];
