import {Component, DestroyRef, effect,inject, viewChild,} from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { Observable } from 'rxjs';
import { TRefreshTokenTable } from '../../models/admin-models';
import { ATableComponent } from '../../../../shared/components/a-table/a-table.component';
import { ITableHeaders, TTableActions} from '../../../../shared/shared-models';
import { SnacksService } from '../../../../shared/snacks.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-users-jwt-table',
  imports: [
    CommonModule,
    ATableComponent,
  ],
  templateUrl: './users-jwt-table.component.html',
  styleUrl: './users-jwt-table.component.scss',
})
export class UsersJWT_TableComponent {
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