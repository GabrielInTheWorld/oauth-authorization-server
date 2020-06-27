import { NgModule } from '@angular/core';
import { MotionRoutingModule } from './motion-routing.module';
import { CommonModule } from '@angular/common';
import { UIModule } from 'src/app/ui/ui.module';
import { MaterialModule } from 'src/app/ui/library/material.module';

@NgModule({
  imports: [UIModule, MaterialModule, CommonModule, MotionRoutingModule]
})
export class MotionModule {}
