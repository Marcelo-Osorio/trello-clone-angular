import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

import { LabelsModalComponent } from './labels-modal.component';
import { Label } from '@models/card.model';

describe('LabelsModalComponent', () => {
  let component: LabelsModalComponent;
  let fixture: ComponentFixture<LabelsModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef>;

  const mockInput = {
    boardId: 1,
    currentLabels: [
      { color: 'green' as const, labelName: 'Feature' },
    ] as Label[],
  };

  beforeEach(async () => {
    sessionStorage.clear();

    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, FontAwesomeModule],
      declarations: [LabelsModalComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: DIALOG_DATA, useValue: mockInput },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LabelsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current labels', () => {
    expect(component.isSelected('green')).toBe(true);
    expect(component.isSelected('red')).toBe(false);
  });

  it('should toggle label on/off', () => {
    component.toggleLabel('red');
    expect(component.isSelected('red')).toBe(true);

    component.toggleLabel('red');
    expect(component.isSelected('red')).toBe(false);
  });

  it('should persist labels to sessionStorage', () => {
    component.toggleLabel('blue');
    const stored = sessionStorage.getItem('labels_1');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(6);
  });

  it('should close dialog with labels', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      labels: component.labels,
    });
  });

  it('should start and save edit', () => {
    component.startEdit(0);
    expect(component.editingIndex).toBe(0);
    component.editDraft = 'Updated Name';
    component.saveEdit();
    expect(component.labels[0].labelName).toBe('Updated Name');
    expect(component.editingIndex).toBeNull();
  });
});
