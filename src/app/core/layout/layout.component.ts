import { Component, inject, Signal, VERSION } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule} from '@angular/material/menu'
import { Store } from '@ngrx/store';
import { coreFeature } from '@core/ngrx/core.reducer';
import { IJWTInfo } from '../../features/auth/models/auth.model';
import { coreActions } from '@core/ngrx/core.actions';
@Component({
    selector: 'app-layout',
    imports: [RouterOutlet, RouterLink, MatIconModule, CommonModule, MatButtonModule, MatMenuModule],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private store = inject(Store)
  public myVer = VERSION.full;
  public userData : Signal<IJWTInfo|null> = this.store.selectSignal(coreFeature.selectUserData);
  ngOnInit(): void {
    this.store.dispatch(coreActions.storageGetUserData())    
  }
}