import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { UserMongoServiceService } from '../../services/user-mongo-service.service';
import { IConfirmMail } from '../../types/auth.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TResultType } from '../../../shared/types/shared-models';

@Component({
  selector: 'app-email-confirm',
  standalone: true,
  imports: [
    MatButtonModule,  
    CommonModule,
  ],
  templateUrl: './email-confirm.component.html',
  styleUrl: './email-confirm.component.scss'
})
export class EmailConfirmComponent {
  public result:TResultType = 'null';
  private subscripitons = new Subscription
  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private userMongoServiceService: UserMongoServiceService
  ) {}
  ngOnInit(): void {
    this.subscripitons.add(
      this.userMongoServiceService.confirmEmail(this.route.snapshot.params as IConfirmMail).subscribe(res=> this.result=res? 'success':'error')
    )
  }
  ngOnDestroy(): void {
    this.subscripitons.unsubscribe()
  }
  backToRegister() {
    this.router.navigate(['register'])
  }
  
}
