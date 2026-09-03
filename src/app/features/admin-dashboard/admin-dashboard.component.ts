import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { UsersJWT_TableComponent } from './components/users-jwt-table/users-jwt-table.component';
import { UsersTableComponent } from './components/users-table/users-table.component';
@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatTabsModule,
    UsersJWT_TableComponent,
    UsersTableComponent
  ],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {}