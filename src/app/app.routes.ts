import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path:'',
    redirectTo:'apps',
    pathMatch:'full'
  },
  {
    path:'apps',
    loadComponent: ()=>import('./features/links-apps/apps-list.component.').then(m=>m.AppsListComponent) //Lazy loading
  },
  {
    path:'register',
    loadChildren: ()=>import('./features/auth/auth.routes').then(m=>m.registerRoutes) //Lazy loading
  },
  {
    path:'admin',
    loadChildren: ()=>import('./features/admin-dashboard/admin.routes').then(m=>m.adminRouter)
  }
];