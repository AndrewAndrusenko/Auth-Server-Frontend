import {Component, Inject, inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import {MatListModule} from '@angular/material/list';

@Component({
    selector: 'app-confirm-bs',
    imports: [MatListModule, MatButtonModule],
    templateUrl: './confirm-bs.component.html',
    styleUrl: './confirm-bs.component.scss'
})
export class ConfirmBsComponent {
  constructor (@Inject(MAT_BOTTOM_SHEET_DATA) public data: {actionToConfirm: string}) { }
  private _bottomSheetRef =
    inject<MatBottomSheetRef<ConfirmBsComponent>>(MatBottomSheetRef);

  dismissForm (result:boolean) {
    this._bottomSheetRef.dismiss({confirm:result})
  }
}
