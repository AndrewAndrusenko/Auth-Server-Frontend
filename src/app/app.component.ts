import { Component, VERSION } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppStorage, StorageService, StorageType } from './shared/services/storage.service';
import { CommonModule } from '@angular/common';
import { filter, Observable, Subscription, tap } from 'rxjs';
import { IJWTInfo } from './auth/types/auth.model';
import { UserMongoServiceService } from './auth/services/user-mongo-service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule} from '@angular/material/menu'
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
    private userMongoServiceService:UserMongoServiceService,
    private storageService:StorageService
  ) {
    this.user$ = this.userMongoServiceService.userDataSubject.asObservable()
    this.appStorage = this.storageService.initStorageObj(StorageType.Seesiion)
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()   
  }
  ngOnInit(): void {
    this.subscriptions.add(
      this.appStorage.getStorageData('jwtInfo').pipe(
        filter(jwtInfo=>(jwtInfo as string)!==''),
        tap(res=>console.log('res',res )),
        
        tap(jwtInfo=>this.userMongoServiceService.userDataSubject.next(JSON.parse(jwtInfo as string)))
      ).subscribe())
  }
}