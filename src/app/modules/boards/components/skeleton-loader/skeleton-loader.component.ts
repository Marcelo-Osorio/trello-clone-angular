import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div *ngFor="let _ of items" class="rounded-lg overflow-hidden shadow-md">
        <div class="px-4 py-3 h-24 animate-pulse bg-gray-200">
          <div class="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-gray-300 rounded w-1/2 mt-auto"></div>
        </div>
      </div>
    </div>
  `
})
export class SkeletonLoaderComponent {
  @Input() count = 4;

  get items(): number[] {
    return Array(this.count).fill(0);
  }
}