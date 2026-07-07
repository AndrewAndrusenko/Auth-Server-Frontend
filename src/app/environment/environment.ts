import { TPasswordValidators } from "../auth/services/auth-validator.service";
const PASSWORD_REQUIREMENTS:TPasswordValidators[] = [
  'hasLower',
  'hasNumber',
  'hasSpecial',
  'hasUpper',
  'minLength'
]
export const ENVIRONMENT = {
    prod:true,
    PASSWORD_SETTINGS:{
        REQUIREMENTS: PASSWORD_REQUIREMENTS,
        MINLENGTH:5
    }
}