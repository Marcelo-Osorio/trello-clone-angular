import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import {
  faClose,
  faTag,
  faUser,
  faCheckSquare,
  faClock,
  faBars,
  faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';

import { Card, CardDescription, Label } from '@models/card.model';
import { Board } from '@models/board.model';
import { User } from '@models/user.model';
import { UsersService } from '@services/users.service';
import { parseDescription } from '@utils/parse-description';

import { LabelsModalComponent } from '../labels-modal/labels-modal.component';
import { DueDateModalComponent } from '../due-date-modal/due-date-modal.component';

interface CardModalInput {
  cardForm: FormGroup;
  card: Card;
  board: Board;
  listTitle: string;
  currentUser: User | null;
}

@Component({
  selector: 'app-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
})
export class CardModalComponent {
  faClose = faClose;
  faTag = faTag;
  faUser = faUser;
  faCheckSquare = faCheckSquare;
  faClock = faClock;
  faBars = faBars;
  faCalendarDay = faCalendarDay;

  cardForm: FormGroup;
  card: Card;
  board: Board;
  listTitle: string;
  description: CardDescription;
  availableMembers: User[] = [];
  showMemberPicker = false;
  addingChecklist = false;
  newChecklistName = '';

  constructor(
    private dialogRef: DialogRef,
    private dialog: Dialog,
    private usersService: UsersService,
    @Inject(DIALOG_DATA) data: CardModalInput,
  ) {
    this.cardForm = data.cardForm;
    this.card = { ...data.card };
    this.board = data.board;
    this.listTitle = data.listTitle;
    this.description = parseDescription(this.card.description);
    this.loadAvailableMembers(data.currentUser);
    this.initFormFromCard();
  }

  private loadAvailableMembers(currentUser: User | null): void {
    const stored = this.usersService.getBoardMembers(this.board.id);
    const seen = new Set<number>();
    const result: User[] = [];
    if (currentUser) {
      result.push(currentUser);
      seen.add(currentUser.id);
    }
    for (const member of stored) {
      if (!seen.has(member.id)) {
        result.push(member);
        seen.add(member.id);
      }
    }
    this.availableMembers = result;
  }

  private initFormFromCard(): void {
    const desc = parseDescription(this.card.description);
    this.cardForm.patchValue({
      cardTitle: this.card.title,
      textDescription: desc.textField,
      dueDate: desc.dueDate,
    });
  }

  // --- Form control access helpers ---

  get titleControl(): AbstractControl | null {
    return this.cardForm.get('cardTitle');
  }

  get descriptionControl(): AbstractControl | null {
    return this.cardForm.get('textDescription');
  }

  get checklistArray(): FormArray {
    return this.cardForm.get('checklist') as FormArray;
  }

  get checklistGroups(): FormGroup[] {
    return this.checklistArray.controls as FormGroup[];
  }

  // --- Form control write methods ---

  onTitleChange(value: string): void {
    this.cardForm.get('cardTitle')?.setValue(value);
  }

  onDescriptionChange(value: string): void {
    this.cardForm.get('textDescription')?.setValue(value);
  }

  onMemberSelect(member: User): void {
    const currentDesc = this.cardForm.get('textDescription')?.value || '';
    const mention = `@${member.name}`.split(' ').join('_');
    const separator = currentDesc.length > 0 && !currentDesc.endsWith(' ') ? ' ' : '';
    this.cardForm.get('textDescription')?.setValue(`${currentDesc}${separator}${mention}`);
    this.showMemberPicker = false;
  }

  // --- Labels ---
  openLabelsModal(): void {
    this.dialog
      .open<LabelsModalOutput>(LabelsModalComponent, {
        data: {
          boardId: this.board.id,
          currentLabels: this.description.labels,
        },
      })
      .closed.subscribe((result) => {
        if (result) {
          this.description = { ...this.description, labels: result.labels };
          this.card = {
            ...this.card,
            description: JSON.stringify(this.description),
          };
        }
      });
  }

  // --- Due dates ---
  openDueDateModal(): void {
    const currentDate = this.description.dueDate || undefined;

    this.dialog
      .open<DueDateModalOutput>(DueDateModalComponent, {
        data: { currentDate },
      })
      .closed.subscribe((result) => {
        if (result !== undefined) {
          if (result.date === null) {
            this.description = { ...this.description, dueDate: '' };
          } else {
            this.description = { ...this.description, dueDate: result.date };
          }
          this.card = {
            ...this.card,
            description: JSON.stringify(this.description),
          };
        }
      });
  }

  // --- Members ---
  toggleMemberPicker(): void {
    this.showMemberPicker = !this.showMemberPicker;
  }

  // --- Checklist ---
  toggleAddChecklist(): void {
    this.addingChecklist = !this.addingChecklist;
    if (!this.addingChecklist) {
      this.newChecklistName = '';
    }
  }

  submitNewChecklist(): void {
    if (!this.newChecklistName.trim()) return;

    const newGroup = new FormGroup({
      groupName: new FormControl(this.newChecklistName.trim()),
      items: new FormArray([]),
    });
    this.checklistArray.push(newGroup);

    this.newChecklistName = '';
    this.addingChecklist = false;
  }

  removeChecklistGroup(index: number): void {
    this.checklistArray.removeAt(index);
  }

  // --- Close ---
  close(): void {
    this.dialogRef.close();
  }

  // --- Helpers ---
  get formattedDueDate(): string {
    if (!this.description.dueDate) return '';
    const d = new Date(this.description.dueDate);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get labelColorClasses(): string[] {
    const map: Record<string, string> = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-400',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
    };
    return this.description.labels.map((l) => map[l.color] || 'bg-gray-400');
  }

  get descriptionSegments(): { text: string; isMention: boolean }[] {
    const text = this.description.textField;
    if (!text) return [];
    const parts: { text: string; isMention: boolean }[] = [];
    const regex = /@\S+/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: text.slice(lastIndex, match.index), isMention: false });
      }
      parts.push({ text: match[0], isMention: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), isMention: false });
    }
    return parts;
  }
}

interface LabelsModalOutput {
  labels: Label[];
}

interface DueDateModalOutput {
  date: string | null;
}
