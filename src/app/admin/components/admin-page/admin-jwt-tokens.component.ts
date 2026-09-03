import {Component, DestroyRef, effect,inject, viewChild,} from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { TRefreshTokenTable } from '../../models/admin-models';
import { ATableComponent } from '../../../shared/components/a-table/a-table.component';
import { ITableHeaders, TTableActions} from '../../../shared/types/shared-models';
import { SnacksService } from '../../../shared/services/snacks.service';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { AdminUsersListComponent } from '../admin-users-list/admin-users-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-admin-page',
  imports: [
    CommonModule,
    MatListModule,
    ATableComponent,
    AdminUsersListComponent,
    MatBottomSheetModule,
    MatTabsModule,
  ],
  templateUrl: './admin-jwt-tokens.component.html',
  styleUrl: './admin-jwt-tokens.component.scss',
})
export class AdminPageComponent {
  tokensTableRef = viewChild(ATableComponent);
  public adminData: Observable<TRefreshTokenTable[]> | undefined = undefined;
  public tableHeaders: ITableHeaders[] = [
    { fieldName: 'action', displayName: 'action' },
    { fieldName: 'userId', displayName: 'userId' },
    { fieldName: 'role', displayName: 'role' },
    { fieldName: 'refreshToken', displayName: 'refreshJWT' },
    { fieldName: 'timeSaved', displayName: 'Time' },
  ];
  public actionsForTable: TTableActions[] = ['Delete'];
  public adminDataService = inject(AdminDataService);
  private snacksService = inject(SnacksService);
  private destroyRef = inject(DestroyRef);
  constructor() {
    effect((onCleanup) => {
      const table = this.tokensTableRef();
      if (table) {
        const actionSub = table.actionInitiated.subscribe((data) =>
          this.actionExecute(data.action, data.data),
        );
        const reloadSub = table.tableReloaded.subscribe((data) =>
          this.snacksService.openSnack(
            `Reloaded with ${data.rowCount} rows`,
            'Ok',
            'success-snackBar',
            'top',
            2000,
          ),
        );
        onCleanup(() => {
          actionSub.unsubscribe();
          reloadSub.unsubscribe();
        });
      }
    });
  }
  actionExecute(action: TTableActions, data: TRefreshTokenTable) {
    switch (action) {
      case 'Delete':
        this.adminDataService
          .deleteRefreshToken(data)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((deleted) => {
            this.snacksService.openSnack(
              `Token for user ${data.userId} has ${deleted.deleted ? '' : 'not '}been deleted `,
              'Ok',
              deleted.deleted ? 'success-snackBar' : 'error-snackBar',
            );
            deleted.deleted
              ? this.tokensTableRef()?.removeRow('userId', data.userId)
              : null;
          });
        break;
    }
  }
}