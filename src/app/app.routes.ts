import { Routes } from '@angular/router';

export const appRoutes: Routes = [] = [
  {
    path:'register',
    loadChildren: ()=>import('./auth/auth.routes').then(m=>m.registerRoutes) //Lazy loading
  },
  {
    path:'apps',
    loadComponent: ()=>import('./apps-list/apps-list.component.').then(m=>m.AppsListComponent) //Lazy loading
  },
  {
    path:'admin',
    loadChildren: ()=>import('./admin/admin.routes').then(m=>m.adminRouter)
  }
];