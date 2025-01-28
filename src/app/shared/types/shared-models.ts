import { AdminDataService } from "../../admin/services/admin-data.service"
import { AuthService } from "../../auth/services/auth.service"
export type TAPIServices = 'MongoService'|'MailService'|'PasswordService'
export type TResultType = 'success'|'error'|'null'
export type TRequestStatus = TResultType & 'loading'
export type TPanelClass = 'success-snackBar'|'error-snackBar'
export type TButtonName = 'Okay'|'Ok'|'Back'|'Go to login'|'Delete'
export type TTableActions = 'Create'|'Create_Example'|'Edit'|'Delete'|'View'
export interface ITableHeaders {
  fieldName:string,
  displayName:string
}
export const SERVICES_TO_USE = {
  adminDataService:AdminDataService,
  authService :AuthService
} as const
export type TserviceToken = keyof typeof SERVICES_TO_USE;
export type TService =  typeof SERVICES_TO_USE [keyof typeof SERVICES_TO_USE];
