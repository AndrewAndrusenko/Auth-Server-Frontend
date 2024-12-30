import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuotesService } from '../../services/quotes.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-quotes-table',
  standalone: true,
  imports:[RouterModule],
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
}
