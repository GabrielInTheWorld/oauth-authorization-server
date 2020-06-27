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

  public get openslidesOAuthUrl(): string {
    return this.buildURL(this.openslidesServer.authorizePath, this.getOptionsForAuthorizing(this.openslidesClient));
  }

  private accessToken: string;

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

  public sayHello(): Promise<void> {
    return this.http.get('/api/hello', null, new HttpHeaders({ authentication: this.accessToken }));
  }

  public helloApi(): Promise<void> {
    return this.http.get(
      '/oauth/greet',
      { token: JSON.stringify({ authorization: this.oauthToken }), hello: 'world' },
      null,
      null,
      'http://localhost:8000'
    );
  }

  public helloOAuth(): Promise<void> {
    return this.http.get(
      '/oauth/greet',
      null,
      new HttpHeaders().set('authorization', this.tokenSubject.value.accessToken),
      null,
      'http://localhost:8000'
    );
  }

  public login(credentials: { username: string; password: string }): void {
    this.http.post<LoginAnswer>('/login', credentials).then(answer => {
      console.log('answer', answer);
      if (answer && answer.success) {
        this.accessToken = answer.token;
      }
    });
  }

  public async oAuth2(): Promise<void> {
    const client = this.openslidesClient;
    const state = this.generateRandomString();
    const codeVerifier = this.generateRandomString();
    await this.storage.set(this.pkceStateStorageKey, state);
    await this.storage.set(this.pkceCodeVerifierStorageKey, codeVerifier);
    // await this.storage.set(this.providerStorageKey, provider);

    const codeChallenge = this.sha(codeVerifier);

    const authUrl = `${client.server.authorizePath}?response_type=code&client_id=${encodeURIComponent(
      client.clientId
    )}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(client.scope)}&redirect_uri=${encodeURIComponent(
      client.redirectUris[0]
    )}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;

    window.location.href = authUrl;
  }

  public async oAuth2Callback(code: string, state: string, userId: string): Promise<void> {
    // const provider = await this.storage.get<ClientProvider>(this.providerStorageKey);
    const storedState = await this.storage.get<string>(this.pkceStateStorageKey);
    const storedCodeVerifier = await this.storage.get(this.pkceCodeVerifierStorageKey);
    // const client = this.getClientByProvider(provider);
    const client = this.openslidesClient;

    console.log('storedState', storedState, state, state.substr(state.indexOf('state')));

    if (storedState !== state) {
      return;
    }
    window.history.replaceState({}, null, '/');
    this.http
      .post<{ token_type: string; access_token: string; refresh_token?: string; token_provider?: string }>(
        '/token',
        {
          grant_type: 'authorization_code',
          code,
          user_id: userId,
          client_id: client.clientId,
          redirect_uri: client.redirectUris[0],
          code_verifier: storedCodeVerifier
        },
        null,
        'http://localhost:8000'
      )
      .then(answer => {
        console.log('answer from token-endpoint', answer);
        this.oauthToken = answer.access_token;
        this.tokenSubject.next({
          accessToken: answer.access_token,
          refreshToken: answer.refresh_token,
          tokenType: answer.token_type,
          tokenProvider: answer.token_provider
        });
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

  public getAccessToken(code: string, state: string): any {
    // const client = this.getClientByProvider(provider);
    const client = this.openslidesClient;
    console.log('get auth-token', code, state, client);
    return this.http
      .post(this.buildURL(client.server.tokenPath, this.getOptionsForToken(client, code)))
      .then(answer => console.log('answer from accesstoken', answer));
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

  private buildURL(path: string, options: UrlOptions, hash?: string): string {
    const newUrl = url.parse(path, true);
    delete newUrl.search;
    if (!newUrl.query) {
      newUrl.query = {};
    }
    for (const key in options) {
      newUrl.query[key] = (options as any)[key];
    }
    if (hash) {
      newUrl.hash = hash;
    }
    return url.format(newUrl);
  }

  private getOptionsForAuthorizing(clientObject: Client): UrlOptions {
    return {
      client_id: clientObject.clientId,
      scope: clientObject.scope,
      //   redirect_uri: Server.PORT === 8000 ? this.client.redirectUris[0] : this.client.redirectUris[1],
      redirect_uri: clientObject.redirectUris[0],
      state: clientObject.state,
      response_type: 'code'
    };
  }

  private getOptionsForToken(client: Client, authCode: string): UrlOptions {
    return {
      client_id: client.clientId,
      client_secret: client.clientSecret,
      redirect_uri: client.redirectUris[0],
      state: client.state,
      code: authCode
    };
  }

  /**
   * PKCE-Helper function.
   * See `https://github.com/aaronpk/pkce-vanilla-js/blob/master/index.html`
   * Generates a random string.
   */
  private generateRandomString(): string {
    const array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => `0${dec.toString(16)}`.substr(-2)).join('');
  }

  private sha(plain: string): string {
    return new sha256().update(plain).digest('hex');
  }
}
