import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { IndicatorColor } from 'src/app/ui/components/indicator/indicator.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit, OnDestroy {
  public get color(): IndicatorColor {
    return this.auth.isAuthenticated() ? 'green' : 'red';
  }

  // public get hasInitiated(): boolean {
  //   return this.pHasInitiated;
  // }

  public get disableConfirmButton(): boolean {
    return !this.loginFormHasValues;
  }

  public loginForm: FormGroup;

  // private _hasInitiated = false
  private loginFormHasValues = false;

  private subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private auth: AuthService) {}

  ngOnInit(): void {
    console.log('route', this.route);

    this.loginForm = this.fb.group({
      username: 'demo',
      password: 'demo'
    });

    this.subscriptions.push(
      this.loginForm.valueChanges.subscribe((value: { username: string; password: string }) => {
        this.checkLoginForm(value);
      })
    );
    this.checkLoginForm(this.loginForm.value);
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions = [];
  }

  public login(): void {
    this.auth.login(this.loginForm.value);
    // this.http.post<LoginAnswer>('/login', credentials).then(answer => {
    //   console.log('answer', answer);
    //   if (answer && answer.success) {
    //     this.accessToken = answer.token;
    //   }
    //   console.log('document.cookies', document.cookie);
    // });
  }

  public clear(): void {
    this.loginForm.setValue({ username: '', password: '' });
  }

  public logout(): void {
    this.auth.logout();
  }

  public approve(): void {}

  public deny(): void {}

  public isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  private checkLoginForm(value: { username: string; password: string }): void {
    this.loginFormHasValues = !!value.password && !!value.username;
  }
}
