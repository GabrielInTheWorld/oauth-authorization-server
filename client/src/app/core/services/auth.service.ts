import { Injectable } from '@angular/core';
import { HttpService, HTTPMethod, Answer } from './http.service';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface LoginAnswer extends Answer {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public get InitiateObservable(): Observable<boolean> {
    return this.initiateSubject.asObservable();
  }

  private readonly initiateSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private accessToken = null;

  public constructor(private http: HttpService) {
    this.whoAmI(() => this.initiateSubject.next(true));
  }

  public sayHello(): Promise<void> {
    return this.http.get('/api/hello', null, new HttpHeaders({ authentication: this.accessToken }));
  }

  public helloApi(): Promise<void> {
    return this.http.get('/api/hello', null, new HttpHeaders().set('authentication', this.accessToken));
  }

  public login(credentials: { username: string; password: string }): void {
    this.http.post<LoginAnswer>('/login', credentials).then(answer => {
      console.log('answer', answer);
      if (answer && answer.success) {
        this.accessToken = answer.token;
      }
    });
  }

  public whoAmI(callback?: () => void): void {
    this.http
      .post<LoginAnswer>('/who-am-i')
      .then(answer => {
        console.log('answer', answer);
        if (answer && answer.success) {
          this.accessToken = answer.token;
        }
      })
      .then(() => (callback ? callback() : undefined));
  }

  public logout(): void {
    this.requestSecureRoute(HTTPMethod.POST, 'logout').then(answer => {
      console.log('logout', answer);
      if (answer && answer.success) {
        this.accessToken = null;
      }
    });
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async requestSecureRoute(method: HTTPMethod, path: string, data?: any): Promise<Answer> {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    const pathToServer = `/api${path}`;
    const headers: HttpHeaders = new HttpHeaders().set('authentication', this.accessToken);
    switch (method) {
      case HTTPMethod.POST:
        return this.http.post(pathToServer, data, headers);
      case HTTPMethod.GET:
        return this.http.get(pathToServer, headers);
    }
  }
}
