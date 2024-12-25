import { Component, VERSION } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { StorageService, StorageType } from './shared/services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    public router:Router,
    private storageService:  StorageService
  ) { }
  title = 'RTQ-NgRx ss';
  public myVer = VERSION.full;
  ngOnInit(): void {
    let context = this;
    window.addEventListener("beforeunload", function (e) {
      console.log('beforeunload');
      let appStorage = context.storageService.initStorageObj(StorageType.IndexDB)
      appStorage.clearStorageData().subscribe(res=>console.log('cleared',res))
    });
  }
}
