import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUser } from '../../../auth/models/auth.model';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { AdminDataService } from '../../services/admin-data.service';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { TFormAction } from '../../../shared/types/shared-models';
import { CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop'
import { catchError, EMPTY } from 'rxjs';
@Component({
    selector: 'app-form-admin-user',
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    CdkDrag,
    CdkDragHandle
],
    templateUrl: './form-admin-user.component.html',
    styleUrl: './form-admin-user.component.scss'
})
export class FormAdminUserComponent {
  @Input() userData:IUser | undefined = undefined;
  @Output() formAction = new EventEmitter <{action:TFormAction, data?:IUser}>
  public formUser: FormGroup
  public roles:string[] = ['user','admin']
  constructor(
    private builder:FormBuilder,
    private adminDataService: AdminDataService
  ) {
    this.formUser = builder.group({
      _id:[null],
      userId:[null,{validators:Validators.required}],
      role:[null],
      email:[null],
      emailConfirmed:[false],
      token:[null],
      passwordToken:[null]
    })
  }
  ngAfterViewInit(): void {
    this.userData? this.formUser.patchValue(this.userData) : null
  }
  sumbitForm() {
    this.adminDataService.adminUpdateUser(this.formUser.value)
    .pipe(
      catchError(err=>{
        console.log('error adminUpdateUser', err)
        this.formAction.emit({action:'Error'})
        return EMPTY
      })
    )
    .subscribe(()=>this.formAction.emit({action:'Edited',data:this.formUser.value}))
  }
  cancelAction() {
    this.formAction.emit({action:'Canceled'})
  }
  get userId() {return this.formUser.get('userId')}
}
