import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { faClose } from '@fortawesome/free-solid-svg-icons';

import { Label, LabelColor } from '@models/card.model';
import { LabelsService } from '@services/labels.service';

interface LabelsModalInput {
  cardForm: FormGroup;
}

const FIXED_COLORS: LabelColor[] = [
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'blue',
];

const COLOR_BG_MAP: Record<LabelColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
};

@Component({
  selector: 'app-labels-modal',
  templateUrl: './labels-modal.component.html',
  styleUrls: ['./labels-modal.component.scss'],
})
export class LabelsModalComponent implements OnDestroy {
  @ViewChild('editInput', { static: false })
  editInput?: ElementRef<HTMLInputElement>;

  faClose = faClose;
  readonly availableColors = FIXED_COLORS;

  labels: Label[] = [];
  mode: 'view' | 'edit' = 'view';
  editingColor: LabelColor | null = null;
  editDraft = '';
  private localLabelNames: Partial<Record<LabelColor, string>> = {};

  private readonly cardForm: FormGroup;
  private readonly labelsSubscription: Subscription;

  constructor(
    private dialogRef: DialogRef<void>,
    private labelsService: LabelsService,
    @Inject(DIALOG_DATA) data: LabelsModalInput,
  ) {
    this.cardForm = data.cardForm;
    this.labelsSubscription = this.labelsService
      .getLabels$()
      .subscribe((labels) => {
        this.labels = labels;
        this.syncLocalLabelNames();
        if (this.editingColor && this.mode === 'edit') {
          this.editDraft = this.getLabelName(this.editingColor);
        }
      });
    this.syncLocalLabelNames();
  }

  ngOnDestroy(): void {
    this.labelsSubscription.unsubscribe();
  }

  get colorBgMap(): Record<LabelColor, string> {
    return COLOR_BG_MAP;
  }

  get labelsArray(): FormArray {
    return this.cardForm.get('labels') as FormArray;
  }

  get currentLabels(): Label[] {
    return this.labelsArray.getRawValue() as Label[];
  }

  isSelected(color: LabelColor): boolean {
    return this.currentLabels.some((label) => label.color === color);
  }

  toggleLabel(color: LabelColor, checked: boolean): void {
    if (!checked) {
      const labelIndex = this.currentLabels.findIndex((label) => label.color === color);
      if (labelIndex !== -1) {
        this.labelsArray.removeAt(labelIndex);
      }

      if (this.editingColor === color) {
        this.backToViewMode();
      }

      return;
    }

    if (this.isSelected(color)) {
      return;
    }

    this.labelsArray.push(
      new FormGroup({
        labelName: new FormControl(this.getLabelName(color)),
        color: new FormControl(color),
      }),
    );
  }

  openEditMode(color: LabelColor): void {
    this.mode = 'edit';
    this.editingColor = color;
    this.editDraft = this.getLabelName(color);

    setTimeout(() => {
      this.editInput?.nativeElement.focus();
      this.editInput?.nativeElement.select();
    }, 0);
  }

  selectEditColor(color: LabelColor): void {
    this.editingColor = color;
    this.editDraft = this.getLabelName(color);

    setTimeout(() => {
      this.editInput?.nativeElement.focus();
      this.editInput?.nativeElement.select();
    }, 0);
  }

  saveEdit(): void {
    if (!this.editingColor) {
      return;
    }

    const labelName = this.editDraft.trim() || this.labelsService.getAutoName(this.editingColor);
    this.localLabelNames[this.editingColor] = labelName;

    const selectedLabelIndex = this.currentLabels.findIndex(
      (label) => label.color === this.editingColor,
    );

    if (selectedLabelIndex !== -1) {
      this.labelsArray.at(selectedLabelIndex).patchValue({ labelName });
    }

    this.backToViewMode();
  }

  backToViewMode(): void {
    this.mode = 'view';
    this.editingColor = null;
    this.editDraft = '';
  }

  onEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveEdit();
    } else if (event.key === 'Escape') {
      this.backToViewMode();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  getLabelName(color: LabelColor): string {
    const localLabelName = this.localLabelNames[color];
    if (localLabelName) {
      return localLabelName;
    }

    const selectedLabel = this.currentLabels.find((label) => label.color === color);
    if (selectedLabel?.labelName) {
      return selectedLabel.labelName;
    }

    return this.getPersistedLabelName(color);
  }

  trackByColor(_: number, color: LabelColor): LabelColor {
    return color;
  }

  private getPersistedLabelName(color: LabelColor): string {
    const boardLabel = this.labels.find((label) => label.color === color);
    if (boardLabel?.labelName) {
      return boardLabel.labelName;
    }

    return this.labelsService.getAutoName(color);
  }

  private syncLocalLabelNames(): void {
    for (const color of this.availableColors) {
      if (!this.localLabelNames[color]) {
        const selectedLabel = this.currentLabels.find((label) => label.color === color);
        this.localLabelNames[color] =
          selectedLabel?.labelName || this.getPersistedLabelName(color);
      }
    }
  }
}
