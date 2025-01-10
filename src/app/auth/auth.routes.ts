import { Route } from "@angular/router";
import { RegisterComponent } from "./components/register/register.component";
import { EmailConfirmComponent } from "./components/email-confirm/email-confirm.component";
import { PasswordRestoreComponent } from "./components/password-restore/password-restore.component";

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