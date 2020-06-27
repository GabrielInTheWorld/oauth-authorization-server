import { NgModule } from '@angular/core';
import { IndexComponent } from './index/index.component';
import { AuthorizeComponent } from './authorize/authorize.component';
import { UIModule } from '../ui/ui.module';
import { MaterialModule } from '../ui/library/material.module';
import { SiteRoutingModule } from './site-routing.module';
import { OauthComponent } from './oauth/oauth.component';
import { RegisterComponent } from './register/register.component';
import { MotionListComponent } from './motions/motion-list/motion-list.component';
import { MotionDetailComponent } from './motions/motion-detail/motion-detail.component';
import { SiteComponent } from './site.component';

const components = [IndexComponent, AuthorizeComponent];

@NgModule({
  imports: [UIModule, MaterialModule, SiteRoutingModule],
  declarations: [...components, OauthComponent, RegisterComponent, MotionListComponent, MotionDetailComponent, SiteComponent],
  exports: [...components]
})
export class SiteModule {}
