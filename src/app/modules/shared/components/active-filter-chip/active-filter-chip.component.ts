import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faClose } from '@fortawesome/free-solid-svg-icons';

import { ActiveFilterChip } from '@models/search.model';

@Component({
  selector: 'app-active-filter-chip',
  templateUrl: './active-filter-chip.component.html',
})
export class ActiveFilterChipComponent {
  @Input() chip!: ActiveFilterChip;
  @Input() removable = false;
  @Output() remove = new EventEmitter<void>();

  faClose = faClose;

  private readonly labelColorClasses: Record<string, string> = {
    green: 'bg-green-500 text-white border-green-400/70',
    yellow: 'bg-yellow-500 text-white border-yellow-400/70',
    orange: 'bg-orange-500 text-white border-orange-400/70',
    red: 'bg-red-500 text-white border-red-400/70',
    purple: 'bg-purple-500 text-white border-purple-400/70',
    blue: 'bg-blue-500 text-white border-blue-400/70',
  };

  get label(): string {
    return this.chip.type === 'search'
      ? `Search: ${this.chip.text}`
      : `Label: ${this.chip.text}`;
  }

  get colorClasses(): string {
    if (this.chip.type === 'label' && this.chip.color) {
      return this.labelColorClasses[this.chip.color] || this.defaultClasses;
    }

    return this.defaultClasses;
  }

  get defaultClasses(): string {
    return 'border-white/10 bg-slate-900/80 text-white';
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit();
  }
}
