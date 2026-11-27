import { inject, Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map, Observable, of } from 'rxjs';
import {passwordValidators,TPasswordValidators} from '../models/password-requirements'
import { AuthApiService } from './auth-api.service';
@Injectable({
  providedIn: 'root'
})
export class AuthValidatorService {
  private authApiService = inject(AuthApiService);
  constructor() { }
  validateUserId ():AsyncValidatorFn {
    return (control:AbstractControl):Observable<ValidationErrors|null> => {
      return this.authApiService.checkUser(control.getRawValue()).pipe(map(taken=>taken? {userIdTaken:taken}:null))
    }
  }
  validateEmail (exceptCurrent:string=''):AsyncValidatorFn {
    return (control:AbstractControl):Observable<ValidationErrors|null> => {
      if (exceptCurrent===control.getRawValue()||control.getRawValue()=='') {return of(null)}
      return this.authApiService.checkEmail(control.getRawValue(),exceptCurrent).pipe(map(taken=>taken? {emailTaken:taken}:null))
    }
  }
  validateEmailExist (exceptCurrent:string=''):AsyncValidatorFn {
    return (control:AbstractControl):Observable<ValidationErrors|null> => {
      return this.authApiService.checkEmail(control.getRawValue(),exceptCurrent).pipe(map(exist=>exist? null:{emailNotExists:!exist}))
    }
  }
  strongPasswordValidation(minLength:number = 1, validators:TPasswordValidators[]): ValidatorFn {
    passwordValidators.minLength.reg = new RegExp(String.raw`^.{${minLength},150}$`);
    passwordValidators.minLength.hint = `${passwordValidators.minLength.hint} is ${minLength} symbols`; 
    return (control:AbstractControl):ValidationErrors|null => {
      let hintMsg = 'Password must contain at least:'
      let result = true
      validators.forEach(key=>{
        result = result && passwordValidators[key].reg.test(control.value);
        hintMsg = hintMsg +'\n'+passwordValidators[key].hint + (passwordValidators[key].reg.test(control.value) ?' - ✅':' - ⛔');;
      })
      Object.assign(control,{hint_strongPasswordValidation:hintMsg})
      if (!result) {
          return { strong: true, hint_strong:hintMsg };
      }
      return null;
    }
  }
}