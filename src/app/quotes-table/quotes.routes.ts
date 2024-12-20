import { Route } from "@angular/router";
import { QuotesTableComponent } from "./components/quotes-table/quotes-table.component";

export const quotesTableRouter:Route[] = [{
  path:'',
  component:QuotesTableComponent,
}] 