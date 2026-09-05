import { Component, effect, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { AdminDataService } from '../../services/admin-data.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TFormAction } from '../../../../shared/shared-models';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { catchError, EMPTY } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IUser } from '@core/models/user.models';
@Component({
  selector: 'app-user-edit-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './user-edit-form.component.html',
  styleUrl: './user-edit-form.component.scss',
})
export class UserEditFormComponent {
  public userData = signal<IUser>(inject<IUser>(MAT_DIALOG_DATA));
  public formAction = output<{ action: TFormAction; data?: IUser }>();
  public formUser: FormGroup;
  public roles: string[] = ['user', 'admin'];
  private builder = inject(FormBuilder);
  private adminDataService = inject(AdminDataService);
  constructor() {
    this.formUser = this.builder.nonNullable.group({
      _id: [null],
      userId: [null, { validators: Validators.required }],
      role: [null],
      email: [null],
      emailConfirmed: [false],
      token: [null],
      passwordToken: [null],
    });
    effect(() => {
      const user = this.userData();
      user ? this.formUser.patchValue(user) : null;
    });
  }
  sumbitForm() {
    this.adminDataService
      .adminUpdateUser(this.formUser.value)
      .pipe(
        catchError((err) => {
          this.formAction.emit({ action: 'Error' });
          return EMPTY;
        }),
      )
      .subscribe(() =>
        this.formAction.emit({ action: 'Edited', data: this.formUser.value }),
      );
  }
  cancelAction() {
    this.formAction.emit({ action: 'Canceled' });
  }
  get userId() {
    return this.formUser.get('userId');
  }
}
