import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService } from '@core/services/config.service';
@Component({
  selector: 'app-quotes-table',
  imports: [MatButtonModule],
  templateUrl: './apps-list.component.html',
  styleUrl: './apps-list.component.scss',
})
export class AppsListComponent {
  private configService = inject(ConfigService);

  redirectTo(code?: string) {
    window.location.href =
      this.configService.config?.APP_HOST ||
      'https://ppklrx85-4203.euw.devtunnels.ms/';
  }
}
