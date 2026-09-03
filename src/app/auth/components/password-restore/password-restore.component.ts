import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthValidatorService } from '../../services/auth-validator.service';
import { AuthService } from '../../services/auth.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SnacksService } from '../../../shared/services/snacks.service';
import { ENVIRONMENT } from '../../../environment/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfigService } from '../../../shared/services/config.service';
@Component({
  selector: 'app-password-restore',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './password-restore.component.html',
  styleUrl: './password-restore.component.scss',
})
export class PasswordRestoreComponent {
 
  private submitButtonHTML = viewChild<ElementRef>('submitButtonHTML');
  private submitNewPasswordHTML = viewChild<ElementRef>('submitButtonSaveNewPasswordHTML');
  public passwordConfirmHTML = viewChild<ElementRef>('passwordConfirmHTML');
  public emailForRestore: FormGroup;
  public processState: 'Sending reseting email' | 'Saving new password' | null =  null;
  private msgSentEmail = 'Email has been sent to reset your password.\n Please create a new password by using a link in the message sent to you';
  public formProcess: 'SendEmail' | 'ResetPassword' = 'SendEmail';
  public hide: boolean = false;
  private userDataPasswordReset: { id: string; token: string } = {
    id: '',
    token: '',
  };
  private passwordCreateValidators: ValidatorFn[];
  private passwordConfirmValidators: ValidatorFn[];
  private RESET_PASSWORD_TIMEOUT =  inject(ConfigService).config?.RESET_PASSWORD_TIMEOUT || 10;
  private fb = inject(FormBuilder);
  private authValidatorService = inject(AuthValidatorService);
  public authService = inject(AuthService);
  private snacksService = inject(SnacksService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  constructor() {
    this.emailForRestore = this.fb.nonNullable.group({
      email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.authValidatorService.validateEmailExist()],
          updateOn: 'blur',
        },
      ],
      passwordCreateFC: ['', { validators: [], updateOn: 'blur' }],
      passwordConfirm: ['', { validators: [], updateOn: 'blur' }],
    });

    this.passwordCreateValidators = [
      Validators.required,
      this.authValidatorService.strongPasswordValidation(
        ENVIRONMENT.PASSWORD_SETTINGS.MINLENGTH,
        ENVIRONMENT.PASSWORD_SETTINGS.REQUIREMENTS,
      ),
    ];
    this.passwordConfirmValidators = [
      Validators.required,
      this.comparePasswordValidator(),
    ];
  }
  ngOnInit(): void {
    this.passwordCreate?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.passwordConfirm?.updateValueAndValidity()),
      )
      .subscribe();
    this.emailForRestore.statusChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((status) => status === 'VALID'),
      )
      .subscribe(() =>
        setTimeout(() => {
          this.formProcess === 'SendEmail'
            ? this.submitButtonHTML()?.nativeElement.focus()
            : this.submitNewPasswordHTML()?.nativeElement.focus();
        }, 100),
      );
    this.formInit(); // Form initialization
  }
  // Form initialization based on route and parameters triggered this form
  // Form can be prepared for changing a password or is used for sending a reset email with a link
  formInit() {
    const params = this.route.params as { id?: string; token?: string };
    const queryParams = this.route.snapshot.queryParams;
    const id = params['id'] || queryParams['id'];
    const token = params['token'] || queryParams['token'];

    if (id && token) {
      this.formProcess = 'ResetPassword';
      this.userDataPasswordReset = params as { id: string; token: string };
      this.email?.clearAsyncValidators();
      this.email?.clearValidators();
      this.passwordCreate?.addValidators(this.passwordCreateValidators);
      this.passwordConfirm?.addValidators(this.passwordConfirmValidators);
    } else {
      this.authService.checkTimer();
    }
  }
  resetPasswordExecute() {
    this.processState = 'Saving new password';
    this.emailForRestore.disable();
    this.authService
      .resetPasswordExecute(
        this.userDataPasswordReset?.id,
        this.userDataPasswordReset?.token,
        this.passwordCreate?.value,
      )
      .pipe(
        catchError(() => {
          this.emailForRestore.enable();
          this.processState = null;
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        this.snacksService.openSnack(
          res
            ? 'Password has been changed'
            : 'Error. User or token has not been found',
          'Okay',
          res ? 'success-snackBar' : 'error-snackBar',
        );
        this.processState = null;
        this.emailForRestore.enable();
        res ? this.router.navigate(['register']) : null;
      });
  }
  resetPasswordPrepare() {
    if (this.email?.invalid) return;
    this.processState = 'Sending reseting email';
    this.emailForRestore.disable();
    this.authService
      .resetPasswordEmail(this.email?.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.processState = null;
          this.emailForRestore.enable();
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        this.processState = null;
        this.emailForRestore.enable();
        this.snacksService.openSnack(
          this.msgSentEmail,
          'Okay',
          'success-snackBar',
        );
        this.authService.setTimerForResend(this.RESET_PASSWORD_TIMEOUT);
      });
  }
  comparePasswordValidator(): ValidatorFn {
    // Validator to compare main password and confirmation of it
    return (control: AbstractControl): ValidationErrors | null => {
      return this.passwordConfirm?.value === this.passwordCreate?.value
        ? null
        : { passowrdDifference: true };
    };
  }
  showPasswordTip() {
    this.snacksService.openSnack(
      (this.passwordCreate?.errors as { hint_strong: string; strong: boolean })
        .hint_strong,
      'Okay',
      'success-snackBar',
      'top',
      20000,
    );
  }
  get email(): FormControl<string> {
    return this.emailForRestore.get('email') as FormControl;
  }
  get passwordCreate(): FormControl<string> {
    return this.emailForRestore?.get('passwordCreateFC') as FormControl;
  }
  get passwordConfirm(): FormControl<string> {
    return this.emailForRestore?.get('passwordConfirm') as FormControl;
  }
}
