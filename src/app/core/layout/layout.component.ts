import { Component, inject, VERSION } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule} from '@angular/material/menu'
import { AuthService } from '../../features/auth/data-access/auth.service';
import { IJWTInfo } from '../../features/auth/models/auth.model';
import { UserCoreService } from '@core/services/user-core.service';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, MatIconModule, CommonModule, MatButtonModule, MatMenuModule],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private userCoreService = inject(UserCoreService)
  public myVer = VERSION.full;
  public user$ : Observable<IJWTInfo> = this.userCoreService.userDataStream$
}