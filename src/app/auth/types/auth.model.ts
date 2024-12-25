import { ObjectId } from "mongodb"
import { TResultType } from "../../shared/types/shared-models"
export const AcRoles:string[] = ['user']
export type TAcRole = (typeof AcRoles)[number]
export interface IUser {
  _id:ObjectId,
  userId:string,
  password:string
  email:string,
  token?:string,
  regDate:string,
  role:TAcRole
}
export interface IJWT {
  jwt:string
  userId:string,
  saved:boolean
}
export interface IErrorMongoIndexDup{
  "errorResponse": {
      "index": number,
      "code": number,
      "errmsg": string,
   }
}
export interface ICustomLoginError {
  "errorResponse": {
    name:'Error'|'email',
    message:string,
    stack?:string
  }
}
export interface ISignUpResult {
  type:TResultType,
  msg:string 
  userSigned?:boolean
}
export interface IConfirmMail {
  id:string,
  token:string
}
export type SentMessageInfo = any;