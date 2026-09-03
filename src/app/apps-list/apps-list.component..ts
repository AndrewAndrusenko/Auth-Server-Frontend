import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService } from '@shared/services/config.service';
import {
  AppStorage,
  StorageService,
  StorageType,
} from '@shared/services/storage.service';
import { AuthService } from '../auth/services/auth.service';
import { IJWTInfo } from '../auth/models/auth.model';
@Component({
  selector: 'app-quotes-table',
  imports: [RouterModule, MatButtonModule],
  templateUrl: './apps-list.component.html',
  styleUrl: './apps-list.component.scss',
})
export class AppsListComponent {
  public result: { data: string } | null = null;
  private configService = inject(ConfigService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private appStorage: AppStorage = inject(StorageService).storage( StorageType.IndexDB,
  );
  ngOnInit(): void {
    this.appStorage
      .getStorageData('jwtInfo')
      .pipe(take(1))
      .subscribe((jwtInfo) => {
        if (jwtInfo) {
          this.authService.setUserData((jwtInfo as { data: IJWTInfo }).data);
        } else {
          this.router.navigate(['register']);
        }
      });
  }
  redirectTo(code?: string) {
    window.location.href =
      this.configService.config?.APP_HOST ||
      'https://ppklrx85-4203.euw.devtunnels.ms/';
  }
}
