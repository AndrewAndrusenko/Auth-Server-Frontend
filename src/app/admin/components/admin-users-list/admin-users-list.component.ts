import { Component, ViewChild } from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { CommonModule } from '@angular/common';
import { MatListModule} from '@angular/material/list';
import { Observable, Subscription } from 'rxjs';
import { ATableComponent } from '../../../shared/components/a-table/a-table.component';
import { ITableHeaders, TTableActions } from '../../../shared/types/shared-models';
import { SnacksService } from '../../../shared/services/snacks.service';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { IUser } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule,MatListModule,ATableComponent,MatBottomSheetModule],
  templateUrl: './admin-users-list.component.html',
  styleUrl: './admin-users-list.component.scss'
})
export class AdminUsersListComponent {
 @ViewChild (ATableComponent) usersTableRef : ATableComponent
  public adminData:Observable<IUser[]>
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
  private subscriptions = new Subscription ()
  constructor (
    public adminDataService:AdminDataService,
    private snacksService:SnacksService,
  ) { }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.subscriptions.add(
     this.usersTableRef.actionInitiated.subscribe(data=>this.actionExecute(data.action,data.data)));
    this.subscriptions.add(
     this.usersTableRef.tableReloaded.subscribe(data=>this.snacksService.openSnack(`Reloaded with ${data.rowCount} rows`,'Ok','success-snackBar','top',2000)));
  }
  actionExecute(action:TTableActions, data:IUser) {
    switch (action) {
      case 'Delete':
        this.subscriptions.add(
          this.adminDataService.deleteUser(data.userId).subscribe(deleted=>{
            this.snacksService.openSnack(`User ${data.userId} has ${deleted.deletedCount===0? 'not ':''}been deleted `,'Ok',deleted.deletedCount? 'success-snackBar':'error-snackBar');
            deleted.deletedCount? this.usersTableRef.removeRow('userId',data.userId) :null
          }))
      break;
    }
  }
}

