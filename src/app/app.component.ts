import { Component, VERSION } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppStorage, StorageService, StorageType } from './shared/services/storage.service';
import { CommonModule } from '@angular/common';
import { filter, Observable, Subscription, tap } from 'rxjs';
import { IJWTInfo } from './auth/models/auth.model';
import { UserMongoServiceService } from './auth/services/user-mongo-service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule} from '@angular/material/menu'
import { AuthService } from './auth/services/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterLink,MatIconModule,CommonModule,MatButtonModule,MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'RTQ-NgRx ss';
  public myVer = VERSION.full;
  public user : {userId:string|null, role:string|null} = {userId:null,role:null} 
  public user$ : Observable<IJWTInfo> 
  private appStorage:AppStorage;
  private subscriptions = new Subscription()
  constructor(
    private authService:AuthService,
    private storageService:StorageService
  ) {
    this.user$ = this.authService.userDataSubject.asObservable()
    this.appStorage = this.storageService.initStorageObj(StorageType.IndexDB)
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()   
  }
  ngOnInit(): void {
    this.subscriptions.add(
      this.appStorage.getStorageData('jwtInfo')
      .subscribe(jwtInfo=>jwtInfo? this.authService.userDataSubject.next((jwtInfo as {data:IJWTInfo}).data):null)
    )
  }
}