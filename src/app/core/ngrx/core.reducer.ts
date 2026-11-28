import { createFeature, createReducer, on } from "@ngrx/store";
import { ICustomLoginError, IJWTInfo } from "../../features/auth/models/auth.model";
import { coreActions } from "./core.actions";
export interface ICoreState {
  userData:IJWTInfo | null,
  isLoading:boolean,
  error:ICustomLoginError|Error|null
}
const initialState:ICoreState = {
  userData: null,
  isLoading: false,
  error: null
}
export const coreFeature = createFeature({
  name:'core',
  reducer:createReducer(
    initialState,
    on(coreActions.storageGetUserData,(state) => ({
      ...state,
      isLoading:true,
    })),
    on(coreActions.storageGetUserDataSuccess,(state, userData) => ({
      ...state,
      isLoading:false,
      userData
    })),
    on(coreActions.storageGetUserDataFailure,(state) => ({
      ...state,
      isLoading:false,
    })),
  )
})