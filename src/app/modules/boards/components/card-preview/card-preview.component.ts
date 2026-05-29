import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';

import { Card, CardDescription, LabelColor } from '@models/card.model';
import { parseDescription } from '@utils/parse-description';

const LABEL_COLOR_MAP: Record<LabelColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
};

@Component({
  selector: 'app-card-preview',
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss'],
})
export class CardPreviewComponent {
  @Input() card!: Card;
  @Output() cardClick = new EventEmitter<number>();

  faCheckSquare = faCheckSquare;

  get parsedDescription(): CardDescription {
    return parseDescription(this.card?.description);
  }

  get hasLabels(): boolean {
    return this.parsedDescription.labels.length > 0;
  }

  get labelClasses(): string[] {
    return this.parsedDescription.labels.map(
      (label) => LABEL_COLOR_MAP[label.color] || 'bg-gray-400'
    );
  }

  get checklistStats(): { checked: number; total: number } | null {
    const groups = this.parsedDescription.checklist;
    if (!groups || groups.length === 0) {
      return null;
    }
    let total = 0;
    let checked = 0;
    for (const group of groups) {
      for (const item of group.items) {
        total++;
        if (item.checked) {
          checked++;
        }
      }
    }
    return total > 0 ? { checked, total } : null;
  }

  onCardClick(): void {
    this.cardClick.emit(this.card.id);
  }
}
