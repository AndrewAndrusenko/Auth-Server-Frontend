import { TPasswordValidators } from "../auth/services/auth-validator.service";

export const SUCCESS_TIME_OUT:number = 3000;
export const RESET_PASSWORD_TIMEOUT:number = 10;
export const REST_ENDPOINT:string = 'http://localhost:3010/';
// export const REST_ENDPOINT:string = 'https://p2zpsq4w-3010.euw.devtunnels.ms/';
export const APP_HOST:string = 'https://p2zpsq4w-4206.euw.devtunnels.ms';
const PASSWORD_REQUIREMENTS:TPasswordValidators[] = [
  'hasLower',
  'hasNumber',
  'hasSpecial',
  'hasUpper',
  'minLength'
]
export const ENVIRONMENT = {
  PASSWORD_SETTINGS:{
    REQUIREMENTS: PASSWORD_REQUIREMENTS,
    MINLENGTH:5
  }
}