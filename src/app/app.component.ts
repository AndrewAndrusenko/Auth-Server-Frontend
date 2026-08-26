import { Component, inject, VERSION } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
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
    public myVer = VERSION.full;
    public user$ : Observable<IJWTInfo> = this.authService.userDataStream$
}