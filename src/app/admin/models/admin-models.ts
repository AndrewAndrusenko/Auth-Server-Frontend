import { IJWTInfo, IJWTInfoToken } from "../../auth/models/auth.model";

export type TRefreshTokenTable = IJWTInfo & Pick<IJWTInfoToken,'refreshToken'> 
export interface ITokenDeleted {
  userId:string,
  deleted:number
}