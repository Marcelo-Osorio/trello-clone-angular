import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

import { DueDateModalComponent } from './due-date-modal.component';

describe('DueDateModalComponent', () => {
  let component: DueDateModalComponent;
  let fixture: ComponentFixture<DueDateModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef>;

  function setup(inputData: { currentDate?: string } = {}) {
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

    TestBed.resetTestingModule();
    return TestBed.configureTestingModule({
      imports: [FormsModule, FontAwesomeModule],
      declarations: [DueDateModalComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: DIALOG_DATA, useValue: inputData },
      ],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(DueDateModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }

  it('should create with no initial date', async () => {
    await setup();
    expect(component).toBeTruthy();
    expect(component.selectedDate).toBeNull();
  });

  it('should create with existing date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await setup({ currentDate: futureDate.toISOString() });
    expect(component.selectedDate).toBeTruthy();
  });

  it('should disable past dates', async () => {
    await setup();
    // Yesterday should be disabled
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    component.viewYear = yesterday.getFullYear();
    component.viewMonth = yesterday.getMonth();
    expect(component.isDisabled(yesterday.getDate())).toBe(true);
  });

  it('should allow selecting future dates', async () => {
    await setup();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    component.viewYear = tomorrow.getFullYear();
    component.viewMonth = tomorrow.getMonth();
    component.selectDay(tomorrow.getDate());
    expect(component.selectedDate).toBeTruthy();
    expect(component.selectedDate!.getDate()).toBe(tomorrow.getDate());
  });

  it('should navigate months', async () => {
    await setup();
    const initialMonth = component.viewMonth;
    component.nextMonth();
    expect(component.viewMonth).toBe((initialMonth + 1) % 12);
    component.prevMonth();
    expect(component.viewMonth).toBe(initialMonth);
  });

  it('should save selected date', async () => {
    await setup();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    component.viewYear = tomorrow.getFullYear();
    component.viewMonth = tomorrow.getMonth();
    component.selectDay(tomorrow.getDate());
    component.save();
    expect(dialogRefSpy.close).toHaveBeenCalled();
    const result = dialogRefSpy.close.calls.mostRecent().args[0] as { date: string };
    expect(result.date).toBeTruthy();
  });

  it('should remove due date', async () => {
    await setup();
    component.remove();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ date: null });
  });

  it('should toggle year picker', async () => {
    await setup();
    expect(component.showYearPicker).toBe(false);
    component.toggleYearPicker();
    expect(component.showYearPicker).toBe(true);
  });

  it('should generate calendar days', async () => {
    await setup();
    const days = component.calendarDays;
    expect(days.length).toBeGreaterThan(28);
    expect(days.length).toBeLessThanOrEqual(42);
  });
});
