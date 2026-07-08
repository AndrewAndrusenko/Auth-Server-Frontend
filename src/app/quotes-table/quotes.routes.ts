import { Route } from "@angular/router";
import { QuotesTableComponent } from "./components/quotes-table/quotes-table.component";
import { roleGuard } from "@shared/guards/access-roles.guard";

export const quotesTableRouter:Route[] = [
    {
        path:'',
        canActivate:[roleGuard(['admin','user'])],
        component:QuotesTableComponent,
    }
] 