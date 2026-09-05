import { ObjectId } from "mongodb"
export const AcRoles = ['user','admin','none'] as const
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