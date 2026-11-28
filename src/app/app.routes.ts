import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/access-roles.guard';
import { LayoutComponent } from '@core/layout/layout.component';

export const appRoutes: Routes = [
  {
    path:'register',
    loadChildren: ()=>import('./features/auth/auth.routes').then(m=>m.registerRoutes) //Lazy loading
  },
  {
    path:'',
    component:LayoutComponent,
    children: [
      {
        canActivate:[roleGuard(['user','admin'])],
        path:'apps',
        loadComponent: ()=>import('./features/apps-list/apps-list.component.').then(m=>m.AppsListComponent) //Lazy loading
      },
      {
        canActivate:[roleGuard(['admin'])],
        path:'admin',
        loadChildren: ()=>import('./features/admin-dashboard/admin.routes').then(m=>m.adminRouter)
      }
    ]
  },
];