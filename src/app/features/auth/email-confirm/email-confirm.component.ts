import { Component, DestroyRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, EMPTY } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SnacksService } from '@shared/snacks.service';
import { TResultType } from '@shared/shared-models';
import { UserMongoService } from '../services/user-mongo-service.service';
import { IConfirmMail } from '../models/auth.model';
@Component({
  selector: 'app-email-confirm',
  imports: [MatButtonModule, CommonModule, MatProgressBarModule, RouterLink],
  templateUrl: './email-confirm.component.html',
  styleUrl: './email-confirm.component.scss',
})
export class EmailConfirmComponent {
  public result: TResultType = 'null';
  public processState: 'Email confirmation..' | null = null;
  private route = inject(ActivatedRoute);
  private userMongoService = inject(UserMongoService);
  private snacksService = inject(SnacksService);
  private destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    this.processState = 'Email confirmation..';
    const id = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id') || '';
    const token = this.route.snapshot.paramMap.get('token') || this.route.snapshot.queryParamMap.get('token') || '';
    if (!id || !token ) {
      this.snacksService.openSnack(
        'Incorrect data provided. Email cannot be confirmed',
        'Okay',
        'error-snackBar',
      );
      return;
    }
    const confirmData: IConfirmMail = { id: id, token: token };
    this.userMongoService
      .confirmEmail(confirmData)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.processState = null;
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        this.processState = null;
        this.result = res ? 'success' : 'error';
      });
  }
}