import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { AsyncValidatorFn, FormBuilder, FormGroup, FormGroupDirective, Validators } from "@angular/forms";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field'
import { MatIconModule} from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule} from '@angular/material/select'
import { UserMongoServiceService } from "../../services/user-mongo-service.service";
import { SUCCESS_TIME_OUT } from "../../../environment/environment";
import { ActivatedRoute, Router } from "@angular/router";
import { ICustomLoginError, ISignUpResult, IUser } from "../../types/auth.model";
import { catchError, EMPTY, of, Subscription } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { AuthValidatorService } from "../../services/auth-validator.service";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { SnacksService } from "../../../shared/services/snacks.service";
type processType ='Logging'|'Signing up'|'Resending email'|null
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
    MatProgressBarModule
  ],
  providers:[FormGroupDirective]

})
export class RegisterComponent {
  private subscriptions = new Subscription;
 
  public registerForm:FormGroup;
  public formProcess:'logIn'|'signUp' = 'logIn'
  public processState:processType = null;
  public signUpResult:ISignUpResult = {type:'null',msg:'',userSigned:false};
  public emailErrUserData:IUser|null = null;
  public hide:boolean = true;
  private userIdValidator:AsyncValidatorFn;
  private emailValidator:AsyncValidatorFn;
  private msgSentSmail ='Email has been sent to confirm your email address.\n Please active your account by using a link in the message sent to you'
  constructor(
    private fb:FormBuilder, 
    private router:Router,
    private route:ActivatedRoute,
    private userMongoServiceService:UserMongoServiceService,
    private authService:AuthService,
    private authValidatorService:AuthValidatorService,
    private snacksService:SnacksService
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
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log('this.route.params',this.route.snapshot.params )
    this.route.snapshot.params?.['logout']? this.userMongoServiceService.logOutUser(this.registerForm.value).subscribe(res=>alert(JSON.stringify(res))):null
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
    this.startProcess('Signing up');
    this.subscriptions.add(
      this.authService.singUpUser(this.registerForm.value).subscribe(res=>{
        this.stopProcess();
        this.signUpResult = res;
        res.type !=='error'? this.snacksService.openSnack(this.msgSentSmail,'Okay','success-snackBar') : null;
        formGroupDirective.resetForm()
        this.registerForm.reset()
        setTimeout(() => this.signUpResult.type='null', SUCCESS_TIME_OUT);
      })
    )
  }
  logInUser() {
    this.startProcess('Logging');
    this.subscriptions.add(
      this.userMongoServiceService.loginUser(this.registerForm.value).pipe(catchError(e=>{
        this.stopProcess();
        console.log('loging err',e )
        this.signUpResult = {type:'error', msg:'Unable to login',userSigned:undefined} 
        return EMPTY
      }
      )).subscribe(res=>{
        this.stopProcess();
        res = res as ICustomLoginError 
        if (res?.errorResponse) {
          this.signUpResult = {type:'error', msg: res.errorResponse.message,userSigned:undefined} 
          res.errorResponse.name==='email'? this.prepareResendEmailForm(res.errorResponse.stack as string): this.emailErrUserData = null;
        } else {
          this.signUpResult = {type:'success', msg: 'Ok'} 
          this.router.navigate(['quotes'])
        }
      })
    )
  }
  prepareResendEmailForm(errMsg:string) {
    this.emailErrUserData = JSON.parse(errMsg)
    this.email?.patchValue(this.emailErrUserData?.email);
    this.email?.addValidators([Validators.required,Validators.email]);
    this.email?.clearAsyncValidators();
    this.email?.addAsyncValidators(this.authValidatorService.validateEmail(this.email.value));
    this.email?.markAsTouched()
    this.email?.updateValueAndValidity();
  }
  resendEmail(){
    this.startProcess('Resending email')
    this.subscriptions.add(
      this.authService.reSendEmailConfirmation({...this.emailErrUserData as IUser,email:this.email?.value}).subscribe(res=>{
        this.stopProcess();
        res.type !=='error'? this.snacksService.openSnack(this.msgSentSmail,'Okay','success-snackBar') : null;
        this.signUpResult={type:'success',msg:'ok',userSigned:undefined}
      })
    )
  }
  startProcess (process:processType) {
    this.registerForm.disable();
    this.processState=process;
    this.signUpResult.type ='null';
    this.signUpResult.msg = '';
  }
  stopProcess () {
    this.registerForm.enable();
    this.processState=null;
  }
  get  userId ()   {return this.registerForm.get('userId') } 
  get  passwordCreate ()   {return this.registerForm.get('password') } 
  get  email ()   {return this.registerForm.get('email') } 
}