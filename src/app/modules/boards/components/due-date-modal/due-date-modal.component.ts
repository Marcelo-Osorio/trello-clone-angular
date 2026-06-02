import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { faChevronLeft, faChevronRight, faClose } from '@fortawesome/free-solid-svg-icons';

interface DueDateModalInput {
  currentDate?: string; // ISO string
}

interface DueDateModalOutput {
  date: string | null; // ISO string or null to remove
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

@Component({
  selector: 'app-due-date-modal',
  templateUrl: './due-date-modal.component.html',
  styleUrls: ['./due-date-modal.component.scss'],
})
export class DueDateModalComponent {
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faClose = faClose;

  viewYear: number;
  viewMonth: number; // 0-11
  selectedDate: Date | null = null;
  selectedHour = 12;
  selectedMinute = 0;
  showYearPicker = false;

  readonly dayNames = DAY_NAMES;
  readonly monthNames = MONTH_NAMES;

  private today: Date;

  constructor(
    private dialogRef: DialogRef<DueDateModalOutput>,
    @Inject(DIALOG_DATA) data: DueDateModalInput,
  ) {
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);

    if (data.currentDate) {
      const d = new Date(data.currentDate);
      this.selectedDate = d;
      this.selectedHour = d.getHours();
      this.selectedMinute = d.getMinutes();
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
    } else {
      this.viewYear = this.today.getFullYear();
      this.viewMonth = this.today.getMonth();
    }
  }

  get calendarDays(): (number | null)[] {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }

  get yearRange(): number[] {
    const currentYear = this.today.getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y <= currentYear + 5; y++) {
      years.push(y);
    }
    return years;
  }

  isDisabled(day: number): boolean {
    const date = new Date(this.viewYear, this.viewMonth, day);
    date.setHours(0, 0, 0, 0);
    return date < this.today;
  }

  isSelected(day: number): boolean {
    if (!this.selectedDate) return false;
    return (
      this.selectedDate.getFullYear() === this.viewYear &&
      this.selectedDate.getMonth() === this.viewMonth &&
      this.selectedDate.getDate() === day
    );
  }

  isToday(day: number): boolean {
    return (
      this.today.getFullYear() === this.viewYear &&
      this.today.getMonth() === this.viewMonth &&
      this.today.getDate() === day
    );
  }

  selectDay(day: number): void {
    if (this.isDisabled(day)) return;
    this.selectedDate = new Date(this.viewYear, this.viewMonth, day);
  }

  prevMonth(): void {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
  }

  nextMonth(): void {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
  }

  toggleYearPicker(): void {
    this.showYearPicker = !this.showYearPicker;
  }

  selectYear(year: number): void {
    this.viewYear = year;
    this.showYearPicker = false;
  }

  save(): void {
    if (!this.selectedDate) return;
    const result = new Date(this.selectedDate);
    result.setHours(this.selectedHour, this.selectedMinute, 0, 0);
    this.dialogRef.close({ date: result.toISOString() });
  }

  remove(): void {
    this.dialogRef.close({ date: null });
  }

  close(): void {
    this.dialogRef.close();
  }

  get hours(): number[] {
    return Array.from({ length: 24 }, (_, i) => i);
  }

  get minutes(): number[] {
    return [0, 15, 30, 45];
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
