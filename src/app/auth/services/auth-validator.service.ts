import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { map, Observable, of } from 'rxjs';
import { UserMongoServiceService } from './user-mongo-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthValidatorService {
  constructor(private userMongoServiceService:UserMongoServiceService) { }
  validateUserId ():AsyncValidatorFn {
    return (control:AbstractControl):Observable<ValidationErrors|null> => {
      // return this.userMongoServiceService.checkUser(control.getRawValue()).pipe(map(taken=>taken? null:null))
      return this.userMongoServiceService.checkUser(control.getRawValue()).pipe(map(taken=>taken? {userIdTaken:taken}:null))
    }
  }
  validateEmail (exceptCurrent:string=''):AsyncValidatorFn {
    return (control:AbstractControl):Observable<ValidationErrors|null> => {
      // return this.userMongoServiceService.checkEmail(control.getRawValue()).pipe(map(taken=>taken? null:null))
      if (exceptCurrent===control.getRawValue()) {return of(null)}
      return this.userMongoServiceService.checkEmail(control.getRawValue(),exceptCurrent).pipe(map(taken=>taken? {emailTaken:taken}:null))
    }
  }
}
