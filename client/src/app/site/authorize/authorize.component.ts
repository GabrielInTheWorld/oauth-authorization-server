import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { IndicatorColor } from 'src/app/ui/components/indicator/indicator.component';
import { Subscription } from 'rxjs';
import { BaseComponent } from 'src/app/core/models/base.component';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent extends BaseComponent implements OnInit, OnDestroy {
  public get color(): IndicatorColor {
    return this.auth.isAuthenticated() ? 'green' : 'red';
  }

  public get hasInitiated(): boolean {
    return this.pHasInitiated;
  }

  public get disableConfirmButton(): boolean {
    return !this.loginFormHasValues;
  }

  public loginForm: FormGroup;

  private pHasInitiated = false;
  private loginFormHasValues = false;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    super();
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: 'demo',
      password: 'demo'
    });

    this.subscriptions.push(
      this.loginForm.valueChanges.subscribe((value: { username: string; password: string }) => {
        this.checkLoginForm(value);
      }),
      this.auth.InitiateObservable.subscribe(hasInitiated => (this.pHasInitiated = hasInitiated))
    );
    this.checkLoginForm(this.loginForm.value);
  }

  public sayHello(): void {
    this.auth.sayHello().then(answer => console.log('say Hello:', answer));
  }

  public login(): void {
    this.auth.login(this.loginForm.value);
  }

  public clear(): void {
    this.loginForm.setValue({ username: '', password: '' });
  }

  public logout(): void {
    this.auth.logout();
  }

  public whoAmI(): void {
    this.auth.whoAmI();
  }

  public isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  private checkLoginForm(value: { username: string; password: string }): void {
    this.loginFormHasValues = !!value.password && !!value.username;
  }
}
