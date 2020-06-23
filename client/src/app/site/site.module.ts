import { NgModule } from '@angular/core';
import { IndexComponent } from './index/index.component';
import { AuthorizeComponent } from './authorize/authorize.component';
import { UIModule } from '../ui/ui.module';
import { MaterialModule } from '../ui/library/material.module';
import { SiteRoutingModule } from './site-routing.module';

const components = [IndexComponent, AuthorizeComponent];

@NgModule({
  imports: [UIModule, MaterialModule, SiteRoutingModule],
  declarations: [...components],
  exports: [...components]
})
export class SiteModule {}
