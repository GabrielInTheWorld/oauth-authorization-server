import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizeComponent } from './site/authorize/authorize.component';
import { IndexComponent } from './site/index/index.component';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, AuthorizeComponent, IndexComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'refreshId',
      headerName: 'X-CSRFToken'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
