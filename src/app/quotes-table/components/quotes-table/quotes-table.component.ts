import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuotesService } from '../../services/quotes.service';

@Component({
  selector: 'app-quotes-table',
  standalone: true,
  imports:[RouterModule],
  templateUrl: './quotes-table.component.html',
  styleUrl: './quotes-table.component.scss'
})
export class QuotesTableComponent {
  public result:any
  constructor(private quotesService:QuotesService) {}
  ngOnInit(): void {
    
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.quotesService.getQuotes().subscribe(r=>{
      console.log('r',r);
      this.result=r})
    
  }
}
