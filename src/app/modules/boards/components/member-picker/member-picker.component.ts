import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import { User } from '@models/user.model';

@Component({
  selector: 'app-member-picker',
  templateUrl: './member-picker.component.html',
  styleUrls: ['./member-picker.component.scss'],
})
export class MemberPickerComponent {
  @Input() members: User[] = [];
  @Input() selectedIds: number[] = [];
  @Output() memberSelect = new EventEmitter<User>();

  faCheck = faCheck;

  isSelected(member: User): boolean {
    return this.selectedIds.includes(member.id);
  }

  toggleMember(member: User): void {
    this.memberSelect.emit(member);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
