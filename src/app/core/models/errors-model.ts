import { TButtonName } from "../../shared/shared-models";
type TAPIServices = 'MongoService'|'MailService'|'PasswordService'
export interface IErrorUI extends Error {
  msg:string
  ml:TAPIServices
}
export interface IErrorHandler {
  code:number,
  message:string,
  retryConnection:boolean,
  authErr?:boolean,
  redirect?:boolean,
  route?:string,
  buttonName?:TButtonName
};
export type Error_Code = 'AUTHENTICATION_FAILED'|'ACCESS_FORBIDEN'|'INTERNAL_ERROR'|'SERVICE_UNAVAILABLE'|'JWT_EXPIRED'|'CLOSE_USER_CONNECTION'
export const SERVER_ERRORS = new Map <Error_Code, IErrorHandler> ([
  ['SERVICE_UNAVAILABLE', {
    code:0,
    message:'Service is unavailable',
    retryConnection:true,
    route:'',
    redirect:false,
    buttonName:'Okay'
  }],
  ['AUTHENTICATION_FAILED', {
    code:401,
    message:'Your session is not authenticated.\n You have to Log In again',
    retryConnection:true,
    route:'register',
    redirect:true,
    buttonName:'Go to login'
  }],
  ['ACCESS_FORBIDEN', {
    code:403,
    message:'Access is forbidden',
    retryConnection:true,
    route:'back',
    redirect:false,
    buttonName:'Back'
  }],
  ['INTERNAL_ERROR', {
    code:500,
    message:'Server is unavailable',
    retryConnection:true,
    route:'',
    redirect:false,
    buttonName:'Okay'
  }],
  ['JWT_EXPIRED', {
    code:511,
    message:'Token jwt is expired',
    retryConnection:true,
    authErr:true,
    route:'register',
    redirect:true,
    buttonName:'Go to login'
  }],
  ['CLOSE_USER_CONNECTION', {
    code:4001,
    message:'Request to close the connection',
    retryConnection:true,
    authErr:true
  }]
])

export const errorsInfo = new Map<string,string> (
 [
  ['ECONNREFUSED', 'Connection has been refused']
]
)
