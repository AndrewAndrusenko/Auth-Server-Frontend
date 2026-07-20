import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService } from '@shared/services/config.service';
@Component({
    selector: 'app-quotes-table',
    imports: [RouterModule, MatButtonModule],
    templateUrl: './apps-list.component.html',
    styleUrl: './apps-list.component.scss'
})
export class AppsListComponent {
  public result:{data:string}|null = null;
  private subscripitons = new Subscription;
  private configService = inject(ConfigService)
  ngOnDestroy(): void {
    this.subscripitons.unsubscribe();
  }
  redirectTo(code?:string) {
    window.location.href = this.configService.config?.APP_HOST || 'https://ppklrx85-4203.euw.devtunnels.ms/'
  } 
}
