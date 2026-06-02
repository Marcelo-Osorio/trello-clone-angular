import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { faClose, faUserPlus, faUserMinus } from '@fortawesome/free-solid-svg-icons';

import { UsersService } from '@services/users.service';
import { User } from '@models/user.model';

interface InviteDialogData {
  boardId: number;
}

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss'],
})
export class InviteDialogComponent {
  faClose = faClose;
  faUserPlus = faUserPlus;
  faUserMinus = faUserMinus;

  users: User[] = [];
  selectedMembers: User[] = [];
  boardId: number;

  constructor(
    private dialogRef: DialogRef<void>,
    private usersService: UsersService,
    @Inject(DIALOG_DATA) data: InviteDialogData,
  ) {
    this.boardId = data.boardId;
    this.loadUsers();
    this.loadExistingMembers();
  }

  private loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
    });
  }

  private loadExistingMembers(): void {
    const stored = localStorage.getItem(`board-members-${this.boardId}`);
    if (stored) {
      try {
        this.selectedMembers = JSON.parse(stored);
      } catch {
        this.selectedMembers = [];
      }
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  addMember(user: User): void {
    if (!this.selectedMembers.some((m) => m.id === user.id)) {
      this.selectedMembers.push(user);
    }
  }

  removeMember(userId: number): void {
    this.selectedMembers = this.selectedMembers.filter((m) => m.id !== userId);
  }

  isSelected(userId: number): boolean {
    return this.selectedMembers.some((m) => m.id === userId);
  }

  onSave(): void {
    localStorage.setItem(
      `board-members-${this.boardId}`,
      JSON.stringify(this.selectedMembers)
    );
    this.dialogRef.close();
  }
}
