import { Route } from "@angular/router";
import { RegisterComponent } from "./login-signup/register.component";
import { PasswordRestoreComponent } from "./password-restore/password-restore.component";
import { EmailConfirmComponent } from "./email-confirm/email-confirm.component";


export const registerRoutes:Route[] = [
  {
    path:'',
    component:RegisterComponent
  },
  {
    path:'logout/:logout',
    component:RegisterComponent
  },
  {
    path:'restore',
    component:PasswordRestoreComponent
  },
  {
    path:'restore/:id/:token',
    component:PasswordRestoreComponent
  },
  {
    path:'confirm-email/:id/:token',
    component:EmailConfirmComponent
  }
]