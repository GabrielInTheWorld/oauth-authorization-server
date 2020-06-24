import { Routes, RouterModule } from '@angular/router';
import { AuthorizeComponent } from './authorize/authorize.component';
import { IndexComponent } from './index/index.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AuthorizeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteRoutingModule {}
