import { Component, ViewChild } from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { CommonModule } from '@angular/common';
import { MatListModule} from '@angular/material/list';
import { Observable, Subscription } from 'rxjs';
import { TRefreshTokenTable } from '../../models/admin-models';
import { ATableComponent } from '../../../shared/components/a-table/a-table.component';
import { ITableHeaders, TTableActions } from '../../../shared/types/shared-models';
import { SnacksService } from '../../../shared/services/snacks.service';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { AdminUsersListComponent } from '../admin-users-list/admin-users-list.component';
import { MatTabsModule} from '@angular/material/tabs'
@Component({
    selector: 'app-admin-page',
    imports: [CommonModule, MatListModule, ATableComponent, AdminUsersListComponent, MatBottomSheetModule, MatTabsModule],
    templateUrl: './admin-jwt-tokens.component.html',
    styleUrl: './admin-jwt-tokens.component.scss'
})
export class AdminPageComponent  {
  @ViewChild (ATableComponent) tokensTableRef : ATableComponent
  public adminData:Observable<TRefreshTokenTable[]>
  public tableHeaders:ITableHeaders[] = [
    {fieldName:'action', displayName:'action' },
    {fieldName:'userId', displayName:'userId' },
    {fieldName:'role', displayName:'role' },
    {fieldName:'refreshToken', displayName:'refreshJWT' },
    {fieldName:'timeSaved', displayName:'Time' },
  ];
  public actionsForTable:TTableActions[]=['Delete'];
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
     this.tokensTableRef.actionInitiated.subscribe(data=>this.actionExecute(data.action,data.data)));
    this.subscriptions.add(
     this.tokensTableRef.tableReloaded.subscribe(data=>this.snacksService.openSnack(`Reloaded with ${data.rowCount} rows`,'Ok','success-snackBar','top',2000)));
  }
  actionExecute(action:TTableActions, data:TRefreshTokenTable) {
    switch (action) {
      case 'Delete':
        this.subscriptions.add(
          this.adminDataService.deleteRefreshToken(data).subscribe(deleted=>{
            console.log('deleted',deleted )
            this.snacksService.openSnack(`Token for user ${data.userId} has ${deleted.deleted? '':'not ' }been deleted `,'Ok',deleted.deleted? 'success-snackBar':'error-snackBar');
            deleted.deleted? this.tokensTableRef.removeRow('userId',data.userId):null
          }))
      break;
    }
  }
}
