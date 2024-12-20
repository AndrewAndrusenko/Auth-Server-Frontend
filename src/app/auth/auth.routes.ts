import { Route } from "@angular/router";
import { RegisterComponent } from "./components/register/register.component";
import { EmailConfirmComponent } from "./components/email-confirm/email-confirm.component";

export const registerRoutes:Route[] = [
  {
    path:'',
    component:RegisterComponent
  },
  {
    path:'confirm-email/:id/:token',
    component:EmailConfirmComponent
  }
]