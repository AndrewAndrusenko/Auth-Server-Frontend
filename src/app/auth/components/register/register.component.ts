import { ChangeDetectorRef, Component, ElementRef, inject, signal, viewChild } from "@angular/core";

import { AsyncValidatorFn, FormBuilder, FormGroup, FormGroupDirective, ValidatorFn, Validators } from "@angular/forms";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field'
import { MatIconModule} from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule} from '@angular/material/select'
import { ENVIRONMENT } from "../../../environment/environment";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ICustomLoginError, ISignUpResult, IUser } from "../../models/auth.model";
import { catchError, EMPTY, filter, Subscription } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { AuthValidatorService } from "../../services/auth-validator.service";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { SnacksService } from "../../../shared/services/snacks.service";
import { ConfigService } from "../../../shared/services/config.service";
type processType ='Logging'|'Signing up'|'Resending email'|null
@Component ( {
    selector: 'rt-register',
    templateUrl: './register.component.html',
    styleUrl: './register-styless.scss',
    imports: [MatInputModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatSelectModule, MatProgressBarModule, RouterLink],
    providers: [FormGroupDirective]
})
export class RegisterComponent {
  passwordHTML = viewChild<ElementRef>('passwordHTML')
  emailHTML= viewChild<ElementRef>('emailHTML')
  emailHTMLResend= viewChild<ElementRef>('emailHTMLResend')
  buttomSubmitHTML= viewChild<ElementRef>('buttomSubmitHTML')
  buttomResendHTML= viewChild<ElementRef>('buttomResendHTML')
  private subscriptions = new Subscription;
  public registerForm:FormGroup;
  public formInvalid = signal<boolean>(false)
  public formProcess:'logIn'|'signUp' = 'logIn'
  public processState:processType = null;
  public signUpResult:ISignUpResult = {type:'null',msg:'',userSigned:false};
  public emailErrUserData:IUser|null = null;
  public hide:boolean = true;
  private userIdValidator:AsyncValidatorFn;
  private emailValidator:AsyncValidatorFn;
  private passwordStrongValidator: ValidatorFn
  private msgSentEmail ='Email has been sent to confirm your email address.\n Please active your account by using a link in the message sent to you'
  SUCCESS_TIME_OUT = inject(ConfigService).config?.SUCCESS_TIME_OUT || 3000
  constructor(
    private fb:FormBuilder, 
    private router:Router,
    private route:ActivatedRoute,
    private authService:AuthService,
    private authValidatorService:AuthValidatorService,
    private snacksService:SnacksService,
    private changeDetector : ChangeDetectorRef
  ) {   
    this.registerForm = this.fb.group ({
      userId: ['', {validators: [Validators.required]}],
      password: ['', {validators: [Validators.required]}],
      email:['',{updateOn:'blur'}],
      role:'user'
    });
    this.userIdValidator = this.authValidatorService.validateUserId();
    this.emailValidator = this.authValidatorService.validateEmail();
    this.passwordStrongValidator =  this.authValidatorService.strongPasswordValidation(
      ENVIRONMENT.PASSWORD_SETTINGS.MINLENGTH,
      ENVIRONMENT.PASSWORD_SETTINGS.REQUIREMENTS
    )
  }
  ngOnInit(): void {
    this.route.snapshot.params?.['logout']? 
    this.subscriptions.add(
      this.authService.logOutUser().subscribe(()=>{
        this.snacksService.openSnack('You have been logged out','Okay','success-snackBar');
        this.router.navigate(['register'])
      })) : null;
    this.subscriptions.add(
      this.registerForm.statusChanges.pipe(filter(data=>data==='VALID')).subscribe(data=>{
        this.emailErrUserData? this.goToResendButton(): this.goToSubmitButton() 
      }));
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  setSignUpFormProcess () {
    this.formProcess='signUp';
    this.passwordCreate?.addValidators(this.passwordStrongValidator)
    this.userId?.addAsyncValidators([this.userIdValidator]);
    this.email?.addValidators([Validators.required,Validators.email]);
    this.email?.addAsyncValidators([this.emailValidator]);
    this.userId?.updateValueAndValidity();
    this.passwordCreate?.updateValueAndValidity();
    this.email?.updateValueAndValidity();
    this.emailErrUserData = null;
    this.signUpResult = {type:'null',msg:''};
    this.changeDetector.detectChanges();
  }
  setLogInProcess () {
    this.formProcess='logIn';
    this.passwordCreate?.removeValidators(this.passwordStrongValidator)
    this.userId?.removeAsyncValidators(this.userIdValidator); 
    this.email?.removeValidators([Validators.required,Validators.email]);
    this.email?.clearAsyncValidators()
    this.email?.updateValueAndValidity();
    this.userId?.updateValueAndValidity()
    this.passwordCreate?.updateValueAndValidity();
    this.changeDetector.detectChanges();
  }
  signUpNewUser(formGroupDirective:FormGroupDirective){
    this.startProcess('Signing up');
    this.subscriptions.add(
      this.authService.singUpUser(this.registerForm.value)
      .subscribe(res=>{
        this.stopProcess();
        this.signUpResult = res;
        formGroupDirective.resetForm()
        this.registerForm.reset()
        if (res.type !=='error') {
        this.snacksService.openSnack(this.msgSentEmail,'Okay','success-snackBar');
        setTimeout(() => this.signUpResult.type='null', this.SUCCESS_TIME_OUT);
        }
      })
    )
  }
  logInUser() {
    if (this.registerForm.invalid) {
      this.formInvalid.set(true)
      return
    }
    this.startProcess('Logging');
    this.subscriptions.add(
      this.authService.loginUser(this.registerForm.value)
      .pipe(catchError(e=>{
        this.stopProcess();
        console.log('loging err',e )
        this.signUpResult = {type:'error', msg:'Unable to login',userSigned:undefined} 
        return EMPTY
      }))
      .subscribe(res=>{
        this.stopProcess();
        res = res as ICustomLoginError 
        if (res?.errorResponse) {
          this.signUpResult = {type:'error', msg: res.errorResponse.message,userSigned:undefined} 
          res.errorResponse.name==='email'? this.prepareResendEmailForm(res.errorResponse.stack as string): this.emailErrUserData = null;
        } else {
          this.signUpResult = {type:'success', msg: 'Ok'} 
          this.snacksService.openSnack('You have been logged in','Okay','success-snackBar');
          this.router.navigate(['apps'])
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
    this.changeDetector.detectChanges();
  }
  resendEmail(){
    this.startProcess('Resending email')
    this.subscriptions.add(
      this.authService.reSendEmailConfirmation({...this.emailErrUserData as IUser,email:this.email?.value})
      .pipe(catchError(e=>{
        this.stopProcess();
        this.signUpResult = {type:'error', msg:'Unable to send email',userSigned:undefined} 
        return EMPTY
      }))
      .subscribe(res=>{
        this.stopProcess();
        res.type !=='error'? this.snacksService.openSnack(this.msgSentEmail,'Okay','success-snackBar') : null;
        this.signUpResult={type:'success',msg:'ok',userSigned:undefined}
      }));
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
  showPasswordTip() {
    this.snacksService.openSnack((this.passwordCreate?.errors as {hint_strong:string, strong:boolean}).hint_strong,'Okay','success-snackBar','top',20000)
  }
  goToSubmitButton () {
    if (!this.emailHTML) {
        return
    }
    this.formProcess==='signUp' && this.email?.invalid ? this.emailHTML()?.nativeElement.blur():null
    setTimeout(() => {this.registerForm.valid && this.buttomSubmitHTML? this.buttomSubmitHTML()?.nativeElement.focus():null;}, 100);
  }
  goToResendButton () {
    if (!this.emailHTMLResend) {
        return
    }
    this.email?.invalid? this.emailHTMLResend()?.nativeElement.blur():null
    setTimeout(() => {this.registerForm.valid && this.buttomResendHTML? this.buttomResendHTML()?.nativeElement.focus():null;}, 100);
  }
  
  get userId() {return this.registerForm.get('userId') } 
  get passwordCreate() {return this.registerForm.get('password')} 
  get email() {return this.registerForm.get('email')} 
}