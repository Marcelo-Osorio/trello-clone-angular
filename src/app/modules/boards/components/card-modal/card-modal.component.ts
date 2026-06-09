import { Component, Inject } from '@angular/core';
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

import { Card, CardDescription, ChecklistGroup, Label } from '@models/card.model';
import { Board } from '@models/board.model';
import { User } from '@models/user.model';
import { CardsService } from '@services/cards.service';
import { UsersService } from '@services/users.service';
import { parseDescription } from '@utils/parse-description';

import { LabelsModalComponent } from '../labels-modal/labels-modal.component';
import { DueDateModalComponent } from '../due-date-modal/due-date-modal.component';

interface CardModalInput {
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

  card: Card;
  board: Board;
  listTitle: string;
  description: CardDescription;
  availableMembers: User[] = [];

  editingTitle = false;
  titleDraft = '';
  editingDescription = false;
  descriptionDraft = '';
  addingChecklist = false;
  newChecklistName = '';
  showMemberPicker = false;

  constructor(
    private dialogRef: DialogRef<Card>,
    private dialog: Dialog,
    private cardsService: CardsService,
    private usersService: UsersService,
    @Inject(DIALOG_DATA) data: CardModalInput,
  ) {
    this.card = { ...data.card };
    this.board = data.board;
    this.listTitle = data.listTitle;
    this.description = parseDescription(this.card.description);
    this.loadAvailableMembers(data.currentUser);
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

  // --- Title editing ---
  startEditTitle(): void {
    this.editingTitle = true;
    this.titleDraft = this.card.title;
  }

  saveTitle(): void {
    const trimmed = this.titleDraft.trim();
    if (trimmed && trimmed !== this.card.title) {
      this.card = { ...this.card, title: trimmed };
      this.persistCard();
    }
    this.editingTitle = false;
  }

  cancelEditTitle(): void {
    this.editingTitle = false;
  }

  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveTitle();
    } else if (event.key === 'Escape') {
      this.cancelEditTitle();
    }
  }

  // --- Description editing ---
  startEditDescription(): void {
    this.editingDescription = true;
    this.descriptionDraft = this.description.textField;
  }

  saveDescription(): void {
    this.description = { ...this.description, textField: this.descriptionDraft };
    this.card = {
      ...this.card,
      description: JSON.stringify(this.description),
    };
    this.persistCard();
    this.editingDescription = false;
  }

  cancelEditDescription(): void {
    this.editingDescription = false;
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
          this.persistCard();
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
          this.persistCard();
        }
      });
  }

  // --- Checklist ---
  startAddChecklist(): void {
    this.addingChecklist = true;
    this.newChecklistName = '';
  }

  submitNewChecklist(): void {
    const trimmed = this.newChecklistName.trim();
    if (!trimmed) return;
    const newGroup: ChecklistGroup = { groupName: trimmed, items: [] };
    this.description = {
      ...this.description,
      checklist: [...this.description.checklist, newGroup],
    };
    this.card = {
      ...this.card,
      description: JSON.stringify(this.description),
    };
    this.persistCard();
    this.addingChecklist = false;
  }

  cancelAddChecklist(): void {
    this.addingChecklist = false;
  }

  onChecklistGroupChange(index: number, updatedGroup: ChecklistGroup): void {
    const checklist = [...this.description.checklist];
    checklist[index] = updatedGroup;
    this.description = { ...this.description, checklist };
    this.card = {
      ...this.card,
      description: JSON.stringify(this.description),
    };
    this.persistCard();
  }

  onChecklistGroupDelete(index: number): void {
    const checklist = this.description.checklist.filter((_, i) => i !== index);
    this.description = { ...this.description, checklist };
    this.card = {
      ...this.card,
      description: JSON.stringify(this.description),
    };
    this.persistCard();
  }

  // --- Members ---
  toggleMemberPicker(): void {
    this.showMemberPicker = !this.showMemberPicker;
  }

  onMemberSelect(member: User): void {
    const mention = `@${member.name}`.split(' ').join('_');
    const current = this.description.textField;
    const separator = current.length > 0 && !current.endsWith(' ') ? ' ' : '';
    this.description = {
      ...this.description,
      textField: `${current}${separator}${mention}`,
    };
    this.card = {
      ...this.card,
      description: JSON.stringify(this.description),
    };
    this.persistCard();
    this.showMemberPicker = false;
  }

  // --- Close ---
  close(): void {
    this.dialogRef.close(this.card);
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

  private persistCard(): void {
    if (!this.card.board || !this.card.list) return;
    this.cardsService
      .updateCard(this.card.id, {
        title: this.card.title,
        description: this.card.description,
        position: this.card.position,
        listId: this.card.list.id,
        boardId: this.card.board.id,
      })
      .subscribe({
        next: (updated) => {
          this.card = { ...updated, members: this.card.members };
        },
      });
  }
}

interface LabelsModalOutput {
  labels: Label[];
}

interface DueDateModalOutput {
  date: string | null;
}
