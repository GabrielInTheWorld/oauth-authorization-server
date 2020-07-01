import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../core/models/base.component';
import { AuthService } from '../core/services/auth.service';
import { IndicatorColor } from '../ui/components/indicator/indicator.component';
import { Router, NavigationEnd, RouterEvent, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent extends BaseComponent implements OnInit {
  public get color(): IndicatorColor {
    return this.auth.isAuthenticated() ? 'green' : 'red';
  }

  public get hasInitiated(): boolean {
    return this.pHasInitiated;
  }

  public get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  public get isSubRoute(): boolean {
    return this.pIsSubRoute;
  }

  private pHasInitiated = false;
  private pIsSubRoute = false;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.router.events
        .pipe(filter((e: any): e is RouterEvent => e instanceof NavigationEnd))
        .subscribe(route => (this.pIsSubRoute = route.url !== '/')),
      this.auth.InitiateObservable.subscribe(hasInitiated => (this.pHasInitiated = hasInitiated)),
      this.route.url.subscribe(urls => (this.pIsSubRoute = !!urls.length))
    );
    this.init();
  }

  public goBack(): void {
    this.router.navigateByUrl('/');
  }

  private async init(): Promise<void> {
    this.pIsSubRoute = window.location.pathname !== '/';
  }
}
