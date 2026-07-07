import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterLink } from '@angular/router';
import { catchError, EMPTY, filter, Observable, of, scan, Subscription, takeWhile, tap, timer } from 'rxjs';
import { AuthValidatorService } from '../../services/auth-validator.service';
import { AuthService } from '../../services/auth.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SnacksService } from '../../../shared/services/snacks.service';
import { ENVIRONMENT } from '../../../environment/environment';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ConfigService } from '../../../shared/services/config.service';
@Component({
    selector: 'app-password-restore',
    imports: [RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, CommonModule, ReactiveFormsModule, MatProgressBarModule, MatTooltipModule],
    templateUrl: './password-restore.component.html',
    styleUrl: './password-restore.component.scss'
})
export class PasswordRestoreComponent {
  @ViewChild ('submitButtonHTML',{read:ElementRef,static:false}) submitButtonHTML: ElementRef | undefined = undefined
  @ViewChild ('submitButtonSaveNewPasswordHTML',{read:ElementRef,static:false}) submitNewPasswordHTML: ElementRef| undefined = undefined
  @ViewChild ('passwordConfirmHTML',{read:ElementRef,static:false}) passwordConfirmHTML: ElementRef| undefined = undefined
  public emailForRestore: FormGroup;
  public processState:'Sending reseting email'|'Saving new password'|null = null;
  private msgSentEmail ='Email has been sent to reset your password.\n Please create a new password by using a link in the message sent to you'
  public formProcess:'SendEmail'|'ResetPassword' = 'SendEmail';
  public hide:boolean = false;
  private subscriptions = new Subscription();
  private userDataPasswordReset: {id:string, token:string} = {id:'',token:''}
  private passwordCreateValidators:ValidatorFn[];
  private passwordConfirmValidators:ValidatorFn[];
  private RESET_PASSWORD_TIMEOUT = inject(ConfigService).config?.RESET_PASSWORD_TIMEOUT || 10
  constructor(
    private fb:FormBuilder,
    private authValidatorService:AuthValidatorService,
    public authService:AuthService,
    private snacksService:SnacksService,
    private route:ActivatedRoute
  ) {
    this.emailForRestore = this.fb.group({
      email:['',{
        validators:[Validators.required,Validators.email], 
        asyncValidators:[this.authValidatorService.validateEmailExist()],updateOn:'blur'}],
      passwordCreateFC:['',{validators:[], updateOn:'blur'}],
      passwordConfirm:['',{validators:[],updateOn:'blur'}]
    });
    
    this.passwordCreateValidators = [Validators.required,authValidatorService.strongPasswordValidation(
      ENVIRONMENT.PASSWORD_SETTINGS.MINLENGTH,
      ENVIRONMENT.PASSWORD_SETTINGS.REQUIREMENTS
    )];
    this.passwordConfirmValidators = [Validators.required,this.comparePasswordValidator()];
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  ngOnInit(): void {
    this.subscriptions.add(
      this.passwordCreate?.valueChanges
      .pipe(tap(()=>this.passwordConfirm?.updateValueAndValidity()))
      .subscribe());
    this.subscriptions.add(
      this.emailForRestore.statusChanges
      .pipe(filter(status=>status==='VALID'))
      .subscribe(()=> 
        setTimeout(() => {
        this.formProcess==='SendEmail'? this.submitButtonHTML?.nativeElement.focus():this.submitNewPasswordHTML?.nativeElement.focus()}, 100)));
    this.formInit() // Form initialization
  }
  // Form initialization based on route and parameters triggered this form
  // Form can be prepared for changing a password or is used for sending a reset email with a link
  formInit () { 
    this.subscriptions.add(
    this.route.params
    .pipe(
      // if the form is used for sending a reset email we need to check if there is an active timer 
      // the timers are used to restrict quantity of requesting for reseting emails
      tap(params => params?.['id']? null : this.authService.checkTimer()), 
      filter(params => params?.['id']))
    .subscribe(params=>{
      this.formProcess = 'ResetPassword';
      this.userDataPasswordReset = params as {id:string, token:string}
      this.email?.clearAsyncValidators();
      this.email?.clearValidators();
      this.passwordCreate?.addValidators(this.passwordCreateValidators)
      this.passwordConfirm?.addValidators(this.passwordConfirmValidators)
    }));
  }
  resetPasswordExecute() {
    this.processState='Saving new password';
    this.emailForRestore.disable();
    this.authService.resetPasswordExecute(this.userDataPasswordReset?.id,this.userDataPasswordReset?.token, this.passwordCreate?.value)
    .pipe(
      catchError(()=>{
        this.emailForRestore.enable();
        this.processState=null;
        return EMPTY;
      })
    )
    .subscribe(res=>{
      this.snacksService.openSnack(res? 'Password has been changed':'Error. User or token has not been found','Okay',res?'success-snackBar':'error-snackBar')
      this.processState = null;
      this.emailForRestore.enable();
    })
  }
  resetPasswordPrepare() {
    this.processState='Sending reseting email';
    this.emailForRestore.disable();
    this.authService.resetPasswordEmail(this.email?.getRawValue())
    .pipe(catchError(err=>{
      this.processState=null;
      this.emailForRestore.enable();
      return EMPTY
    }))
    .subscribe(res=>{
      this.processState = null;
      this.emailForRestore.enable();
      this.snacksService.openSnack(this.msgSentEmail,'Okay','success-snackBar');
      this.authService.setTimerForResend(this.RESET_PASSWORD_TIMEOUT);
    });
  }
  comparePasswordValidator():ValidatorFn { // Validator to compare main password and confirmation of it
    return (control:AbstractControl):ValidationErrors|null => {
      return (this.passwordConfirm?.value===this.passwordCreate?.value? null: {passowrdDifference:true});
    };
  }
  showPasswordTip() {
    this.snacksService.openSnack((this.passwordCreate?.errors as {hint_strong:string, strong:boolean}).hint_strong,'Okay','success-snackBar','top',20000)
  }
  get email () {return this.emailForRestore.get('email')}
  get passwordCreate () {return this.emailForRestore?.get('passwordCreateFC')}
  get passwordConfirm () {return this.emailForRestore?.get('passwordConfirm')}
}
