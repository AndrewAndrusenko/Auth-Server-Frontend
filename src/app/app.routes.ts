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
    canActivate:[roleGuard],
    children: [
      {
        path:'apps',
        loadComponent: ()=>import('./features/links-apps/apps-list.component.').then(m=>m.AppsListComponent) //Lazy loading
      },
      {
        path:'admin',
        loadChildren: ()=>import('./features/admin-dashboard/admin.routes').then(m=>m.adminRouter)
      }
    ]
  },
];