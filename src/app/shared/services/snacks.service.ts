import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, MatSnackBarVerticalPosition, TextOnlySnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { TButtonName, TPanelClass } from '../types/shared-models';
import { SUCCESS_TIME_OUT } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SnacksService {
 private snackBar = inject(MatSnackBar)
  constructor() { }

  openSnack (message:string, buttonName:TButtonName, panelClass:TPanelClass,verticalPosition:MatSnackBarVerticalPosition='top',duration=SUCCESS_TIME_OUT):MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message,buttonName,{
      panelClass:[panelClass],
      horizontalPosition:'center',
      verticalPosition:verticalPosition,
      duration:panelClass==='success-snackBar'? duration : 60000
    })
  }
  openSnackObserve (message:string, buttonName:TButtonName, panelClass:TPanelClass,verticalPosition:MatSnackBarVerticalPosition='top'):Observable<void> {
    return this.openSnack(message,buttonName,panelClass).onAction()
  }
}
