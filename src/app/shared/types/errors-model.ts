import { TAPIServices, TButtonName } from "./shared-models";
export interface IErrorUI extends Error {
  msg:string
  ml:TAPIServices
}
export interface IErrorCode {
    message:string,
    redirect:boolean,
    route:string,
    buttonName:TButtonName
}
export const errorsCode = new Map<number,IErrorCode> (
[
  [403,{
    message:'Access is forbidden',
    route:'back',
    redirect:false,
    buttonName:'Back'
  }],
  [401,{
    message:'Your session is not authenticated.\n You have to Log In again',
    route:'register',
    redirect:true,
    buttonName:'Go to login'
  }],
  [0,{
    message:'Service is unavailable',
    route:'',
    redirect:false,
    buttonName:'Okay'
  }]
]
)
export const errorsInfo = new Map<string,string> (
 [
  ['ECONNREFUSED', 'Connection has been refused']
]
)
