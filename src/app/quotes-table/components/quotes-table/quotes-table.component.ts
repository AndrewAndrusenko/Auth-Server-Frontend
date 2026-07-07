import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuotesService } from '../../services/quotes.service';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService } from '../../../shared/services/config.service';
@Component({
    selector: 'app-quotes-table',
    imports: [RouterModule, MatButtonModule],
    templateUrl: './quotes-table.component.html',
    styleUrl: './quotes-table.component.scss'
})
export class QuotesTableComponent {
  public result:{data:string}|null = null;
  private subscripitons = new Subscription;
  private quotesService = inject(QuotesService)
  private configService = inject(ConfigService)
  ngOnInit(): void {
    this.subscripitons.add(this.quotesService.getQuotes().subscribe(res=>this.result=res));
  }
  ngOnDestroy(): void {
    this.subscripitons.unsubscribe();
  }
  redirectTo(code?:string) {
    window.location.href = this.configService.config?.APP_HOST || 'https://ppklrx85-4203.euw.devtunnels.ms/'
  } 
}
