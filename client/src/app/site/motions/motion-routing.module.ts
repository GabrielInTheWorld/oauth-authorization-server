import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MotionListComponent } from './motion-list/motion-list.component';
import { MotionDetailComponent } from './motion-detail/motion-detail.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MotionListComponent
  },
  {
    path: ':id',
    component: MotionDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MotionRoutingModule {}
