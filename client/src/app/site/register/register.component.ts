import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from 'src/app/core/models/base.component';
import { IndicatorColor } from 'src/app/ui/components/indicator/indicator.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { HttpService } from 'src/app/core/services/http.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends BaseComponent implements OnInit {
  public get color(): IndicatorColor {
    return this.auth.isAuthenticated() ? 'green' : 'red';
  }

  public get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  public registerForm: FormGroup;

  private appName: string;
  private appDescription: string;
  private redirectUrl: string;

  public constructor(private fb: FormBuilder, private auth: AuthService, private http: HttpService) {
    super();
  }

  public ngOnInit(): void {
    this.registerForm = this.fb.group({
      appName: ['', Validators.required],
      appDescription: '',
      redirectUrl: ['', Validators.required]
    });
    this.subscriptions.push(
      this.registerForm.valueChanges.subscribe(value => {
        this.appName = value.appName;
        this.appDescription = value.appDescription;
        this.redirectUrl = value.redirectUrl;
      })
    );
  }

  public confirm(): void {
    this.http
      .post('/api/register-oauth', {
        app_name: this.appName,
        app_description: this.appDescription,
        redirect_url: this.redirectUrl
      })
      .then(answer => console.log('answer', answer));
  }
}
