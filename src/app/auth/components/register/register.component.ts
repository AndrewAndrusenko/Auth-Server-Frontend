import { Component, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { AsyncValidatorFn, FormBuilder, FormGroup, FormGroupDirective, Validators } from "@angular/forms";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field'
import { MatIconModule} from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule} from '@angular/material/select'
import { MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { UserMongoServiceService } from "../../services/user-mongo-service.service";
import { SUCCESS_TIME_OUT } from "../../../environment/environment";
import { Router } from "@angular/router";
import { ICustomLoginError, ISignUpResult, IUser } from "../../types/auth.model";
import { Subscription } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { AuthValidatorService } from "../../services/auth-validator.service";
@Component ( {
  selector: 'rt-register',
  templateUrl:'./register.component.html',
  styleUrl: './register-styless.scss',
  standalone:true,
  imports:[
    MatInputModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  providers:[FormGroupDirective]

})
export class RegisterComponent {
  private subscriptions = new Subscription;
  private snackBar = inject(MatSnackBar)
  public registerForm:FormGroup;
  public formProcess:'logIn'|'signUp' = 'logIn'
  public signUpResult:ISignUpResult = {type:'null',msg:'',userSigned:false};
  public emailErrUserData:IUser|null = null;
  public hide:boolean = true;
  private userIdValidator:AsyncValidatorFn;
  private emailValidator:AsyncValidatorFn;
  constructor(
    private fb:FormBuilder, 
    private router:Router,
    private userMongoServiceService:UserMongoServiceService,
    private authService:AuthService,
    private authValidatorService:AuthValidatorService
  ) {   
    this.registerForm = this.fb.group ({
      userId: ['User', {validators: [Validators.required]}],
      password: ['Password', {validators: [Validators.required]}],
      email:[''],
      role:'user'
    });
    this.userIdValidator = this.authValidatorService.validateUserId();
    this.emailValidator = this.authValidatorService.validateEmail();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  setSignUpFormProcess () {
    this.formProcess='signUp';
    this.email?.clearAsyncValidators()
    this.userId?.addAsyncValidators(this.userIdValidator);
    this.email?.addValidators([Validators.required,Validators.email]);
    this.email?.addAsyncValidators(this.emailValidator);
    this.userId?.updateValueAndValidity();
    this.emailErrUserData = null;
    this.signUpResult = {type:'null',msg:''};
  }
  setLogInProcess () {
    this.formProcess='logIn';
    this.userId?.removeAsyncValidators(this.userIdValidator); 
    this.email?.removeValidators([Validators.required,Validators.email]);
    this.email?.clearAsyncValidators()
    this.email?.updateValueAndValidity();
    this.userId?.updateValueAndValidity()
  }
  signUpNewUser(formGroupDirective:FormGroupDirective){
    this.subscriptions.add(
      this.authService.singUpUser(this.registerForm.value).subscribe(res=>{
        this.signUpResult=res
        if (res.type !=='error') {
            this.snackBar.open('Email has been sent to confirm your email address.\nPlease active your account by using a link in the message sent to you','Okay',{
              panelClass:['custom-snackBar'],
              horizontalPosition:'center',
              verticalPosition:'top',
            })
            formGroupDirective.resetForm()
            this.registerForm.reset()
            setTimeout(() => this.signUpResult.type='null', SUCCESS_TIME_OUT);
        }
      })
    )
  }
  logInUser() {
    this.subscriptions.add(
      this.userMongoServiceService.loginUser(this.registerForm.value).subscribe(res=>{
        res = res as ICustomLoginError 
        if (res?.errorResponse) {
          this.signUpResult = {type:'error', msg: res.errorResponse.message,userSigned:undefined} 
          if (res.errorResponse.name==='email') {
            this.emailErrUserData = JSON.parse(res.errorResponse.stack as string)
            this.email?.patchValue(this.emailErrUserData?.email);
            this.email?.addValidators([Validators.required,Validators.email]);
            this.email?.clearAsyncValidators();
            this.email?.addAsyncValidators(this.authValidatorService.validateEmail(this.email.value));
            this.email?.markAsTouched()
            this.email?.updateValueAndValidity();
          } else {
            this.emailErrUserData = null;
          }
          console.log('error',res);
        } else {
          this.signUpResult = {type:'success', msg: 'Ok'} 
          this.router.navigate(['quotes'])
        }
      })
    )
  }
  resendEmail(){
    this.subscriptions.add(
      this.authService.reSendEmailConfirmation({...this.emailErrUserData as IUser,email:this.email?.value}).subscribe(res=>{
        if (res.type !=='error') {
          this.snackBar.open('Email has been sent to confirm your email address.\n Please active your account by using a link in the message sent to you','Okay',{
            panelClass:['custom-snackBar'],
            horizontalPosition:'center',
            verticalPosition:'top',
          })
          this.signUpResult={type:'success',msg:'ok',userSigned:undefined}
        }
      })
    )
  }
  get  userId ()   {return this.registerForm.get('userId') } 
  get  passwordCreate ()   {return this.registerForm.get('password') } 
  get  email ()   {return this.registerForm.get('email') } 
}