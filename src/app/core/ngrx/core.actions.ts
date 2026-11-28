import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { IJWTInfo } from "../../features/auth/models/auth.model";

export const coreActions = createActionGroup({
  source:'core',
  events:{
    'Storage Get UserData':emptyProps(),
    'Storage Get UserData Success':props<IJWTInfo>(),
    'Storage Get UserData Failure':emptyProps(),
  }
})