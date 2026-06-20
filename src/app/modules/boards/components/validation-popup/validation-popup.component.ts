import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

export interface ValidationPopupData {
  errors: { control: string; message: string }[];
}

export interface ValidationPopupResult {
  action: 'continue' | 'discard';
}

@Component({
  selector: 'app-validation-popup',
  templateUrl: './validation-popup.component.html',
  styleUrls: ['./validation-popup.component.scss'],
})
export class ValidationPopupComponent {
  faCircleExclamation = faCircleExclamation;

  constructor(
    private dialogRef: DialogRef<ValidationPopupResult>,
    @Inject(DIALOG_DATA) public data: ValidationPopupData,
  ) {}

  continueEditing(): void {
    this.dialogRef.close({ action: 'continue' });
  }

  discardChanges(): void {
    this.dialogRef.close({ action: 'discard' });
  }
}
