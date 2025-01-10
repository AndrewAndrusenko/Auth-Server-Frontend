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
  passwordToken?:string,
  regDate:string,
  role:TAcRole
}
export interface IJWT {
  jwt:string,
  refreshToken:string,
}
export interface IJWTInfo {
  role:string,
  userId:string,
  _id:string
}
export interface IJWTInfoToken extends IJWT {
  jwtInfo:IJWTInfo
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
export interface ILogOut {
  userId:string,
  logout:boolean
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