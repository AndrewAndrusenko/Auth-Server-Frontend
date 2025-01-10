import { Component } from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {
  public adminData:Observable<string>
  constructor(
    private adminDataService:AdminDataService
  ) {
    this.adminData = adminDataService.getAdminPage()
  }
}
