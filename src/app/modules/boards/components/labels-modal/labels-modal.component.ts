import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { faCheck, faClose } from '@fortawesome/free-solid-svg-icons';

import { Label, LabelColor } from '@models/card.model';

interface LabelsModalInput {
  boardId: number;
  currentLabels: Label[];
}

interface LabelsModalOutput {
  labels: Label[];
}

const FIXED_COLORS: LabelColor[] = ['green', 'yellow', 'orange', 'red', 'purple', 'blue'];

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
export class LabelsModalComponent {
  faCheck = faCheck;
  faClose = faClose;

  labels: Label[] = [];
  editingIndex: number | null = null;
  editDraft = '';

  private boardId: number;

  constructor(
    private dialogRef: DialogRef<LabelsModalOutput>,
    @Inject(DIALOG_DATA) data: LabelsModalInput,
  ) {
    this.boardId = data.boardId;
    this.labels = this.loadLabels(data.currentLabels);
  }

  get colorBgMap(): Record<LabelColor, string> {
    return COLOR_BG_MAP;
  }

  isSelected(color: LabelColor): boolean {
    return this.labels.some((l) => l.color === color);
  }

  toggleLabel(color: LabelColor): void {
    if (this.isSelected(color)) {
      this.labels = this.labels.filter((l) => l.color !== color);
    } else {
      const existingName = this.getStoredName(color);
      this.labels = [...this.labels, { color, labelName: existingName }];
    }
    this.persistLabels();
  }

  startEdit(index: number): void {
    this.editingIndex = index;
    this.editDraft = this.labels[index].labelName;
  }

  saveEdit(): void {
    if (this.editingIndex === null) return;
    const trimmed = this.editDraft.trim();
    const updated = [...this.labels];
    updated[this.editingIndex] = { ...updated[this.editingIndex], labelName: trimmed };
    this.labels = updated;
    this.editingIndex = null;
    this.persistLabels();
  }

  cancelEdit(): void {
    this.editingIndex = null;
  }

  onEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  close(): void {
    this.dialogRef.close({ labels: this.labels });
  }

  private loadLabels(currentLabels: Label[]): Label[] {
    // Merge current card labels with stored names
    const stored = this.getStoredLabels();
    return currentLabels.map((cl) => {
      const storedLabel = stored.find((s) => s.color === cl.color);
      return { ...cl, labelName: cl.labelName || storedLabel?.labelName || '' };
    });
  }

  private getStoredLabels(): Label[] {
    try {
      const raw = sessionStorage.getItem(`labels_${this.boardId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private getStoredName(color: LabelColor): string {
    const stored = this.getStoredLabels();
    const found = stored.find((s) => s.color === color);
    return found?.labelName || '';
  }

  private persistLabels(): void {
    // Save all labels (with names) to sessionStorage for this board
    const allLabels: Label[] = [];
    for (const color of FIXED_COLORS) {
      const existing = this.labels.find((l) => l.color === color);
      const stored = this.getStoredNameFromSession(color);
      allLabels.push({
        color,
        labelName: existing?.labelName || stored || '',
      });
    }
    sessionStorage.setItem(`labels_${this.boardId}`, JSON.stringify(allLabels));
  }

  private getStoredNameFromSession(color: LabelColor): string {
    try {
      const raw = sessionStorage.getItem(`labels_${this.boardId}`);
      if (!raw) return '';
      const stored: Label[] = JSON.parse(raw);
      const found = stored.find((s) => s.color === color);
      return found?.labelName || '';
    } catch {
      return '';
    }
  }
}
