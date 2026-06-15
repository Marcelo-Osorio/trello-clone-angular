import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { faClose } from '@fortawesome/free-solid-svg-icons';

interface DueDateModalInput {
  cardForm: FormGroup;
}

@Component({
  selector: 'app-due-date-modal',
  templateUrl: './due-date-modal.component.html',
  styleUrls: ['./due-date-modal.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class DueDateModalComponent {
  faClose = faClose;
  selectedDate: Date | null = null;
  readonly today: Date;

  private cardForm: FormGroup;

  constructor(
    private dialogRef: DialogRef<void>,
    @Inject(DIALOG_DATA) data: DueDateModalInput,
  ) {
    this.cardForm = data.cardForm;
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);

    const dueDate = this.dueDateControl?.value;
    if (dueDate) {
      const parsedDate = new Date(dueDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        this.selectedDate = parsedDate;
      }
    }
  }

  get dueDateControl(): AbstractControl | null {
    return this.cardForm.get('dueDate');
  }

  get formattedSelectedDate(): string {
    if (!this.selectedDate) {
      return '';
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(this.selectedDate);
  }

  onDateChange(date: Date | null): void {
    this.selectedDate = date;
  }

  save(): void {
    if (!this.selectedDate) {
      return;
    }

    const result = new Date(this.selectedDate);
    result.setHours(23, 59, 59, 999);

    this.dueDateControl?.setValue(result.toISOString());
    this.dueDateControl?.markAsTouched();

    if (this.dueDateControl?.invalid) {
      return;
    }

    this.dialogRef.close();
  }

  remove(): void {
    this.selectedDate = null;
    this.dueDateControl?.setValue('');
    this.dueDateControl?.markAsTouched();
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
