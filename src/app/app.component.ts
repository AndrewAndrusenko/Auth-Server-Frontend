import { Component, inject, VERSION } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AppStorage, StorageService, StorageType } from './shared/services/storage.service';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { IJWTInfo } from './auth/models/auth.model';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule} from '@angular/material/menu'
import { AuthService } from './auth/services/auth.service';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, MatIconModule, CommonModule, MatButtonModule, MatMenuModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    private authService = inject(AuthService)
    private storageService = inject(StorageService)
    private router = inject(Router)
    public myVer = VERSION.full;
    public user$ : Observable<IJWTInfo> = this.authService.userDataStream$
    private appStorage:AppStorage = this.storageService.storage(StorageType.IndexDB)
    private subscriptions = new Subscription()
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()   
  }
  ngOnInit(): void {
    this.subscriptions.add(
      this.appStorage.getStorageData('jwtInfo')
      .subscribe(jwtInfo=>{
        if (jwtInfo) {
            this.authService.setUserData((jwtInfo as {data:IJWTInfo}).data)
            this.router.navigate(['quotes'])
        } else {
            this.router.navigate(['register'])
        }
      })
    )
  }
}