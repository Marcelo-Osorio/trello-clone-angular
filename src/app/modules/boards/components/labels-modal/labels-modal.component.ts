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
import { faCheck, faClose } from '@fortawesome/free-solid-svg-icons';

import { Label, LabelColor } from '@models/card.model';
import { LabelsService } from '@services/labels.service';

interface LabelsModalInput {
  boardId: number;
  cardId: number;
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

  faCheck = faCheck;
  faClose = faClose;
  readonly availableColors = FIXED_COLORS;

  labels: Label[] = [];
  mode: 'view' | 'edit' = 'view';
  editingColor: LabelColor | null = null;
  editDraft = '';

  private readonly boardId: number;
  private readonly cardId: number;
  private readonly cardForm: FormGroup;
  private readonly labelsSubscription: Subscription;

  constructor(
    private dialogRef: DialogRef<void>,
    private labelsService: LabelsService,
    @Inject(DIALOG_DATA) data: LabelsModalInput,
  ) {
    this.boardId = data.boardId;
    this.cardId = data.cardId;
    this.cardForm = data.cardForm;
    this.labelsSubscription = this.labelsService
      .getLabels$()
      .subscribe((labels) => {
        this.labels = labels;
        if (this.editingColor && this.mode === 'edit') {
          this.editDraft = this.getLabelName(this.editingColor);
        }
      });
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
    return this.labelsArray.value as Label[];
  }

  isSelected(color: LabelColor): boolean {
    return this.currentLabels.some((label) => label.color === color);
  }

  toggleLabel(color: LabelColor): void {
    if (this.isSelected(color)) {
      const labelIndex = this.currentLabels.findIndex(
        (label) => label.color === color,
      );
      if (labelIndex !== -1) {
        this.labelsArray.removeAt(labelIndex);
      }

      this.labelsService.removeLabelFromCard(this.boardId, color, this.cardId);
      return;
    }

    const label = this.labelsService.toggleLabel(
      this.boardId,
      color,
      this.cardId,
    );
    this.labelsArray.push(
      new FormGroup({
        labelName: new FormControl(label.labelName),
        color: new FormControl(label.color),
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

  saveEdit(): void {
    if (!this.editingColor) {
      return;
    }

    const trimmed = this.editDraft.trim();
    if (!trimmed) {
      return;
    }

    this.labelsService.renameLabel(this.boardId, this.editingColor, trimmed);

    const selectedLabelIndex = this.currentLabels.findIndex(
      (label) => label.color === this.editingColor,
    );
    if (selectedLabelIndex !== -1) {
      this.labelsArray
        .at(selectedLabelIndex)
        .patchValue({ labelName: trimmed });
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
    const selectedLabel = this.currentLabels.find(
      (label) => label.color === color,
    );
    if (selectedLabel?.labelName) {
      return selectedLabel.labelName;
    }

    const boardLabel = this.labels.find((label) => label.color === color);
    if (boardLabel?.labelName) {
      return boardLabel.labelName;
    }

    return this.labelsService.getAutoName(color);
  }

  isEditColorAvailable(color: LabelColor): boolean {
    if (color === this.editingColor) {
      return true;
    }

    return !this.labels.some((label) => label.color === color);
  }

  trackByColor(_: number, color: LabelColor): LabelColor {
    return color;
  }
}
