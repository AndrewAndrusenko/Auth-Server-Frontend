import { inject, Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { TButtonName, TPanelClass } from './shared-models';
import { ConfigService } from '../core/services/config.service';

@Injectable({
  providedIn: 'root',
})
export class SnacksService {
  private snackBar = inject(MatSnackBar);
  private configService = inject(ConfigService);
  openSnack(
    message: string,
    buttonName: TButtonName,
    panelClass: TPanelClass,
    verticalPosition: MatSnackBarVerticalPosition = 'top',
    duration = this.configService.config?.SUCCESS_TIME_OUT,
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, buttonName, {
      panelClass: [panelClass],
      horizontalPosition: 'center',
      verticalPosition: verticalPosition,
      duration: panelClass === 'success-snackBar' ? duration : 60000,
    });
  }
  openSnackObserve(
    message: string,
    buttonName: TButtonName,
    panelClass: TPanelClass,
    verticalPosition: MatSnackBarVerticalPosition = 'top',
    duration = this.configService.config?.SUCCESS_TIME_OUT,
  ): Observable<void> {
    return this.openSnack(
      message,
      buttonName,
      panelClass,
      verticalPosition,
      duration,
    ).onAction();
  }
}
