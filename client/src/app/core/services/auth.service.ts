import { Injectable } from '@angular/core';
import { HttpService, HTTPMethod, Answer } from './http.service';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { sha256 } from 'sha.js';
import * as url from 'url';
interface LoginAnswer extends Answer {
  token: string;
}

interface Server {
  authorizePath: string;
  tokenPath: string;
}

interface Client {
  clientId: string;
  clientSecret?: string;
  state: string;
  scope: string;
  redirectUris: string[];
  server: Server;
  accessToken?: string;
  refreshToken?: string;
}

export interface TokenType {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  tokenProvider?: string;
}

export interface UrlOptions {
  response_type?: string;
  scope?: string;
  client_id: string;
  redirect_uri: string;
  state: string;
  code?: string;
  client_secret?: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public get InitiateObservable(): Observable<boolean> {
    return this.initiateSubject.asObservable();
  }

  public get TokenTypeObservable(): Observable<TokenType> {
    return this.tokenSubject.asObservable();
  }

  public get accessToken(): string {
    return this._accessToken;
  }

  private _accessToken: string;

  private oauthToken: string;

  private readonly refreshToken: string;

  private readonly state: string;

  private readonly providerStorageKey = 'provider';
  private readonly pkceStateStorageKey = 'pkceState';
  private readonly pkceCodeVerifierStorageKey = 'pkceCodeVerifier';

  private readonly openslidesServer = {
    authorizePath: 'http://localhost:8000/authorize',
    tokenPath: 'http://localhost:8000/token'
  };

  private readonly openslidesClient: Client = {
    clientId: 'oauth-client-1',
    redirectUris: ['http://localhost:4210/callback'],
    scope: 'user',
    state: 'openslides',
    server: this.openslidesServer
  };

  private readonly initiateSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly tokenSubject: BehaviorSubject<TokenType> = new BehaviorSubject(null);

  public constructor(private readonly http: HttpService, private readonly storage: StorageService) {
    this.whoAmI(() => this.initiateSubject.next(true));
  }

  public hello(): void {
    this.http.get('/').then(answer => {
      console.log('answer', answer);
      console.log('document.cookie', document.cookie);
    });
  }

  public async sayHello(): Promise<void> {
    return this.http.get('/api/hello', null, new HttpHeaders({ authentication: this._accessToken }));
  }

  public login(credentials: { username: string; password: string }): void {
    this.http.post<LoginAnswer>('/login', credentials).then(answer => {
      console.log('answer', answer);
      if (answer && answer.success) {
        this._accessToken = answer.token;
        this.http.accessToken = answer.token;
      }
    });
  }

  public whoAmI(callback?: () => void): void {
    this.http
      .post<LoginAnswer>('/who-am-i')
      .then(answer => {
        console.log('answer', answer);
        if (answer && answer.success) {
          this._accessToken = answer.token;
        }
      })
      .then(() => (callback ? callback() : undefined));
  }

  public logout(): void {
    this.requestSecureRoute(HTTPMethod.POST, 'logout').then(answer => {
      console.log('logout', answer);
      if (answer && answer.success) {
        this._accessToken = null;
      }
    });
  }

  public isAuthenticated(): boolean {
    return !!this._accessToken;
  }

  private setAccessToken(token: string): void {
    this._accessToken = token;
    this.http.accessToken = token;
  }

  private async requestSecureRoute(method: HTTPMethod, path: string, data?: any): Promise<Answer> {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    const pathToServer = `/api${path}`;
    console.log('authentication', this._accessToken);
    const headers: HttpHeaders = new HttpHeaders().set('authentication', this._accessToken);
    switch (method) {
      case HTTPMethod.POST:
        return this.http.post(pathToServer, data, headers);
      case HTTPMethod.GET:
        return this.http.get(pathToServer, headers);
    }
  }
}
