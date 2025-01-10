import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserMongoServiceService } from '../../services/user-mongo-service.service';
import { IConfirmMail } from '../../types/auth.model';
import { CommonModule } from '@angular/common';
import { Subscription} from 'rxjs';
import { TResultType } from '../../../shared/types/shared-models';
import { MatProgressBarModule} from '@angular/material/progress-bar';
@Component({
  selector: 'app-email-confirm',
  standalone: true,
  imports: [MatButtonModule, CommonModule, MatProgressBarModule,RouterLink
  ],
  templateUrl: './email-confirm.component.html',
  styleUrl: './email-confirm.component.scss'
})
export class EmailConfirmComponent {
  public result:TResultType = 'null';
  public processState:|'Email confirmation..'|null=null;
  private subscripitons = new Subscription
  constructor(
    private route: ActivatedRoute,
    private userMongoServiceService: UserMongoServiceService
  ) {
  }
  ngOnInit(): void {
    this.processState='Email confirmation..'
    this.subscripitons.add(
      this.userMongoServiceService.confirmEmail(this.route.snapshot.params as IConfirmMail)
      .subscribe(res=> {
        this.processState = null;
        this.result=res? 'success':'error'
      }));
  }
  ngOnDestroy(): void {
    this.subscripitons.unsubscribe()
  }
}