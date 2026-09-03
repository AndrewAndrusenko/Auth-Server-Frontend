import { Route } from "@angular/router";
import { roleGuard } from "@core/guards/access-roles.guard";
import { AdminDashboardComponent } from "./admin-dashboard.component";

export const adminRouter: Route[] = [
    {
        path:'',
        canActivate:[roleGuard(['admin'])],
        component:AdminDashboardComponent
    }
]