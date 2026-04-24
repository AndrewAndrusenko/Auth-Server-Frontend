import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuotesService } from '../../services/quotes.service';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-quotes-table',
    imports: [RouterModule, MatButtonModule],
    templateUrl: './quotes-table.component.html',
    styleUrl: './quotes-table.component.scss'
})
export class QuotesTableComponent {
  public result:{data:string}|null;
  private subscripitons = new Subscription;
  
  constructor(private quotesService:QuotesService) {
    this.result  = null;
  }
  ngOnInit(): void {
    this.subscripitons.add(this.quotesService.getQuotes().subscribe(res=>this.result=res));
  }
  ngOnDestroy(): void {
    this.subscripitons.unsubscribe();
  }
  redirectTo(code?:string) {
    window.location.href = 'https://p2zpsq4w-4203.euw.devtunnels.ms/'
  } 
}
