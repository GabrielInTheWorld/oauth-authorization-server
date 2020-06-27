import { Routes, RouterModule } from '@angular/router';
import { AuthorizeComponent } from './authorize/authorize.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { SiteComponent } from './site.component';

const routes: Routes = [
  {
    path: '',
    component: SiteComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AuthorizeComponent
      },
      {
        path: 'callback',
        pathMatch: 'full',
        component: AuthorizeComponent
      },
      {
        path: 'register',
        pathMatch: 'full',
        component: RegisterComponent
      },
      {
        path: 'motions',
        loadChildren: () => import('./motions/motion.module').then(m => m.MotionModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteRoutingModule {}
