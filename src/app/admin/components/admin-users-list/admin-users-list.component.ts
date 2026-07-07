import { Component, ViewChild } from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { CommonModule } from '@angular/common';
import { MatListModule} from '@angular/material/list';
import { Observable, Subscription } from 'rxjs';
import { ATableComponent } from '../../../shared/components/a-table/a-table.component';
import { ITableHeaders, TFormAction, TTableActions } from '../../../shared/types/shared-models';
import { SnacksService } from '../../../shared/services/snacks.service';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { IUser } from '../../../auth/models/auth.model';
import { FormAdminUserComponent } from '../form-admin-user/form-admin-user.component';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-admin-users-list',
    imports: [CommonModule, MatListModule, ATableComponent, MatBottomSheetModule],
    templateUrl: './admin-users-list.component.html',
    styleUrl: './admin-users-list.component.scss'
})
export class AdminUsersListComponent {
 @ViewChild (ATableComponent) usersTableRef : ATableComponent | undefined = undefined
  public adminData:Observable<IUser[]> | undefined = undefined
  public tableHeaders:ITableHeaders[] = [
    {fieldName:'action', displayName:'action' },
    {fieldName:'userId', displayName:'userId' },
    {fieldName:'role', displayName:'role' },
    {fieldName:'email', displayName:'email' },
    {fieldName:'emailConfirmed', displayName:'emailConfirmed' },
    {fieldName:'_id', displayName:'Id' },
    {fieldName:'token', displayName:'emailToken' },
    {fieldName:'passwordToken', displayName:'passwordToken' },
  ];
  public actionsForTable:TTableActions[]=['Delete','Edit'];
  private subscriptions = new Subscription ();
  private userFormRef:MatDialogRef <FormAdminUserComponent> | undefined = undefined;
  constructor (
    public adminDataService:AdminDataService,
    private snacksService:SnacksService,
    private dialog:MatDialog
  ) { }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.subscriptions.add(
      this.usersTableRef?.actionInitiated.subscribe(data=>this.actionExecute(data.action,data.data)));
    this.subscriptions.add(
      this.usersTableRef?.tableReloaded.subscribe(data=>this.snacksService.openSnack(`Reloaded with ${data.rowCount} rows`,'Ok','success-snackBar','top',2000)));
  }
  formActionHandle(data:{action:TFormAction, data?:IUser}) {
    console.log('', data)
    switch (data.action) {
      case 'Canceled':
        this.userFormRef?.close()
      break;
      case 'Edited':
        this.usersTableRef?.reloadTable()
        this.userFormRef?.close()
      break;
    }
  }
  actionExecute(action:TTableActions, data:IUser) {
    switch (action) {
      case 'Delete':
        this.subscriptions.add(
          this.adminDataService.deleteUser(data.userId).subscribe(deleted=>{
            this.snacksService.openSnack(`User ${data.userId} has ${deleted.deletedCount===0? 'not ':''}been deleted `,'Ok',deleted.deletedCount? 'success-snackBar':'error-snackBar');
            deleted.deletedCount? this.usersTableRef?.removeRow('userId',data.userId) :null
          }))
      break;
      case 'Edit':
        this.userFormRef = this.dialog.open(FormAdminUserComponent,{panelClass: 'form-dialog'})    
        this.subscriptions.add(
          this.userFormRef.afterOpened().subscribe(()=>
            this.subscriptions.add(this.userFormRef?.componentInstance.formAction.subscribe(data=>this.formActionHandle(data)))
          )
        )  
        this.userFormRef.componentInstance.userData = data
      break;
    }
  }
}

