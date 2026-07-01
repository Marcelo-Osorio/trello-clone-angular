import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ActiveFilterChipComponent } from './components/active-filter-chip/active-filter-chip.component';
import { ButtonComponent } from './components/button/button.component';

@NgModule({
  declarations: [ButtonComponent, ActiveFilterChipComponent],
  imports: [CommonModule, FontAwesomeModule],
  exports: [ButtonComponent, ActiveFilterChipComponent],
})
export class SharedModule {}
