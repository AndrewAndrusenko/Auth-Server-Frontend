import {
  Component,
  DestroyRef,
  inject,
  Injector,
  input,
  output,
  SimpleChange,
  Type,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { catchError, filter, Subscription, throwError } from 'rxjs';
import {
  ITableHeaders,
  SERVICES_TO_USE,
  TserviceToken,
  TTableActions,
} from '../../shared-models';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ConfirmBsComponent } from '../confirm-bs/confirm-bs.component';
import {
  AdminDataService,
  TTablesNames,
} from '../../../features/admin-dashboard/services/admin-data.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import * as XLSX from 'xlsx';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-a-table',
  imports: [
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    MatPaginatorModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './a-table.component.html',
  styleUrl: './a-table.component.scss',
})
export class ATableComponent {
  readOnly = input<boolean>(false);
  tableName = input.required<TTablesNames>();
  data = input<any>([]);
  columnsWithHeaders = input<ITableHeaders[]>([]);
  actionsForTable = input<TTableActions[]>([]);
  reloadServiceToken = input<TserviceToken>();
  deleteConfirmMsg = input<string>('');
  actionInitiated = output<{ action: TTableActions; data: any }>();
  tableReloaded = output<{ rowCount: number }>();
  private service: AdminDataService | AuthService | undefined = undefined;
  public dataSource = new MatTableDataSource<any>();
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);
  public filterControl = new FormControl('');
  public disabledControlElements: boolean = false;
  public columnsToDisplay: string[] = [];
  public columnsHeaderToDisplay: string[] = [];
  private confirm_BS = inject(MatBottomSheet);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    this.setHeaders();
    if (this.reloadServiceToken()) {
      this.service = this.injector.get(
        SERVICES_TO_USE[this.reloadServiceToken()!] as Type<
          AdminDataService | AuthService
        >,
      );
    }
    this.reloadTable(false);
    this.filterControl.valueChanges
      .pipe(
        filter((data) => data !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((newFilter) => {
        this.dataSource.filter = newFilter.trim().toLowerCase();
        this.dataSource.paginator
          ? this.dataSource.paginator.firstPage()
          : null;
      });
  }
  ngOnChanges(changes: SimpleChange): void {
    changes?.currentValue?.data ? this.updateDataTable(this.data()) : null;
    changes?.currentValue?.columnsWithHeaders ? this.setHeaders() : null;
  }
  initAction(action: TTableActions, data: any) {
    action === 'Delete'
      ? this.confirm_BS
          .open(ConfirmBsComponent, {
            data: {
              actionToConfirm: `Please confirm:\n${this.deleteConfirmMsg()} ${data.userId}`,
            },
          })
          .afterDismissed()
          .pipe(
            filter((confimed) => confimed.confirm === true),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe(() =>
            this.actionInitiated.emit({ action: action, data: data }),
          )
      : this.actionInitiated.emit({ action: action, data: data });
  }
  reloadTable(emit = true) {
    if (!this.service) {
      return;
    }
    this.service
      .reloadTable(this.tableName())
      .pipe(
        catchError((err) => {
          console.log('reloadTable err', err);
          return throwError(() => err);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.updateDataTable(data);
        emit ? this.tableReloaded.emit({ rowCount: data.length }) : null;
      });
  }
  removeRow(field: string, value: string) {
    this.dataSource.data.splice(
      this.dataSource.data.findIndex((el) => el[field] === value),
      1,
    );
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
  }
  updateDataTable(data: any[]) {
    this.dataSource.data = data;
    this.dataSource.filterPredicate = this.customFilter;
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
  }
  setHeaders() {
    this.columnsToDisplay = this.columnsWithHeaders().map((el) => el.fieldName);
    this.columnsHeaderToDisplay = this.columnsWithHeaders().map(
      (el) => el.displayName,
    );
  }
  updateFilter(el: string) {
    this.filterControl.patchValue(
      this.filterControl.value + (this.filterControl.value ? ',' : '') + el,
    );
  }

  customFilter = (data: any, filter: string) => {
    let filter_array = filter
      .trim()
      .split(',')
      .map((el) => [el, 1]);
    this.columnsToDisplay.forEach((col) =>
      filter_array.forEach((fil) => {
        data[col] &&
        data[col]
          .toString()
          .toUpperCase()
          .includes(fil[0].toString().toUpperCase())
          ? (fil[1] = 0)
          : null;
      }),
    );
    return (
      !filter ||
      filter_array.reduce((acc, val) => acc + Number(val[1]), 0) === 0
    );
  };
  exportToExcel() {
    let numberFields: string[] = [];
    let dateFields: string[] = [];
    let dataToExport = [];
    if (numberFields !== undefined) {
      dataToExport = this.dataSource.data.map((el) => {
        Object.keys(el).forEach((key) => {
          switch (true == true) {
            case numberFields.includes(key):
              return (el[key] = Number(el[key]));
            case dateFields.includes(key):
              return (el[key] = new Date(el[key]));
            default:
              return (el[key] = el[key]);
          }
        });
        return el;
      });
    }
    const fileName = this.tableName() + '.xlsx';
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.tableName());
    XLSX.writeFile(wb, fileName);
  }
}