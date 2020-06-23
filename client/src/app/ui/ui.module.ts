import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './library/material.module';
import { IndicatorComponent } from './components/indicator/indicator.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

const components = [IndicatorComponent, LoadingSpinnerComponent];

@NgModule({
  imports: [CommonModule, MaterialModule],
  exports: [MaterialModule, ...components],
  declarations: [...components]
})
export class UIModule {}
