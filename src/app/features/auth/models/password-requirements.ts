export const passwordValidators = {
  'minLength':{ reg: /^.{1,150}$/, hint:'minimum length'},
  'hasNumber':{ reg: /\d/, hint:'one number'},
  'hasUpper':{reg: /[A-Z]/, hint:'one uppercase symbol'},
  'hasLower':{reg: /[a-z]/, hint:'one lowcase symbol'},
  'hasSpecial':{reg: /[$@$!%*?&]/, hint:'one special symbol ($@$!%*?&)'}
}
export type TPasswordValidators = keyof typeof passwordValidators
const PASSWORD_REQUIREMENTS_VALIDATORS:TPasswordValidators[] = [
  'hasLower',
  'hasNumber',
  'hasSpecial',
  'hasUpper',
  'minLength'
]
export const PASSWORD_REQUIREMENTS = {
    prod:true,
    PASSWORD_SETTINGS:{
        REQUIREMENTS: PASSWORD_REQUIREMENTS_VALIDATORS,
        MINLENGTH:5
    }
}