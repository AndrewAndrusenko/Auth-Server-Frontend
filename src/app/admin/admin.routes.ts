import { Route } from "@angular/router";
import { AdminPageComponent } from "./components/admin-page/admin-jwt-tokens.component";
import { roleGuard } from "@shared/guards/access-roles.guard";

export const adminRouter: Route[] = [
    {
        path:'',
        canActivate:[roleGuard(['admin'])],
        component:AdminPageComponent
    }
]