import { Route } from "@angular/router";
import { AdminPageComponent } from "./components/admin-page/admin-jwt-tokens.component";

export const adminRouter: Route[] = [{
  path:'',
  component:AdminPageComponent
}
]