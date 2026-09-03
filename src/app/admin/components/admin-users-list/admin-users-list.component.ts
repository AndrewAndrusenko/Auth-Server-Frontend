import {
  Component,
  inject,
  effect,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { Observable, switchMap } from 'rxjs';
import { ATableComponent } from '../../../shared/components/a-table/a-table.component';
import {
  ITableHeaders,
  TFormAction,
  TTableActions,
} from '../../../shared/types/shared-models';
import { SnacksService } from '../../../shared/services/snacks.service';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { IUser } from '../../../auth/models/auth.model';
import { FormAdminUserComponent } from '../form-admin-user/form-admin-user.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-users-list',
  imports: [CommonModule, MatListModule, ATableComponent, MatBottomSheetModule],
  templateUrl: './admin-users-list.component.html',
  styleUrl: './admin-users-list.component.scss',
})
export class AdminUsersListComponent {
  private usersTableRef = viewChild(ATableComponent);
  public adminData: Observable<IUser[]> | undefined = undefined;
  public tableHeaders: ITableHeaders[] = [
    { fieldName: 'action', displayName: 'action' },
    { fieldName: 'userId', displayName: 'userId' },
    { fieldName: 'role', displayName: 'role' },
    { fieldName: 'email', displayName: 'email' },
    { fieldName: 'emailConfirmed', displayName: 'emailConfirmed' },
    { fieldName: '_id', displayName: 'Id' },
    { fieldName: 'token', displayName: 'emailToken' },
    { fieldName: 'passwordToken', displayName: 'passwordToken' },
  ];
  public actionsForTable: TTableActions[] = ['Delete', 'Edit'];
  private userFormRef: MatDialogRef<FormAdminUserComponent> | undefined =  undefined;
  public adminDataService = inject(AdminDataService);
  private snacksService = inject(SnacksService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  constructor() {
    effect((onCleanup) => {
      const table = this.usersTableRef();
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
  formActionHandle(data: { action: TFormAction; data?: IUser }) {
    switch (data.action) {
      case 'Canceled':
        this.userFormRef?.close();
        break;
      case 'Edited':
        this.usersTableRef()?.reloadTable();
        this.userFormRef?.close();
        break;
    }
  }
  actionExecute(action: TTableActions, data: IUser) {
    switch (action) {
      case 'Delete':
        this.adminDataService
          .deleteUser(data.userId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((deleted) => {
            this.snacksService.openSnack(
              `User ${data.userId} has ${deleted.deletedCount === 0 ? 'not ' : ''}been deleted `,
              'Ok',
              deleted.deletedCount ? 'success-snackBar' : 'error-snackBar',
            );
            deleted.deletedCount? this.usersTableRef()?.removeRow('userId', data.userId) : null;
          });
        break;
      case 'Edit':
        this.userFormRef = this.dialog.open(FormAdminUserComponent, {panelClass: 'form-dialog',data:data});
        if (!this.userFormRef) return;
        this.userFormRef
          .afterOpened()
          .pipe(
            switchMap(() => outputToObservable(this.userFormRef!.componentInstance.formAction)),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe((data) => this.formActionHandle(data));
        break;
    }
  }
}
