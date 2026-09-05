import { TAcRole } from "@core/models/user.models"

export type TResultType = 'success'|'error'|'null'
export interface IJWT {
  jwt:string,
  refreshToken:string,
}
export interface IJWTInfo {
  role:TAcRole,
  userId:string,
  _id:string
}
export interface IJWTInfoToken extends IJWT {
  jwtInfo:IJWTInfo
  timeSaved?:string
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
export type TMailTypes ='PasswordRestMail'|'emailConfirmationMail'