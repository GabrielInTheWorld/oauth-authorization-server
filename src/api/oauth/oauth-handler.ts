import express from 'express';
import shajs from 'sha.js';
import url from 'url';

import { Constructable, InjectService, Inject } from '../../core/modules/decorators';
import { Generator } from '../interfaces/generator';
import { Modules } from '../../model-services/modules';
import { OAuthHandlerInterface } from './oauth-handler-interface';
import TokenGenerator from '../services/token-generator';
import UserService from '../../core/models/user/user-service';

type CodeChallengeMethod = undefined | 'S256';

interface Client {
  clientId: string;
  clientSecret?: string;
  codeChallenge?: string;
  codeChallengeMethod?: CodeChallengeMethod;
  state: string;
  scope: string;
  redirectUri?: string;
  clientName?: string;
}

interface UrlOptions {
  response_type: string;
  scope?: string;
  client_id: string;
  redirect_uri: string;
  state: string;
  code_challenge?: string;
  code_challenge_method?: CodeChallengeMethod;
}

@Constructable(OAuthHandlerInterface)
export class OAuthHandler implements OAuthHandlerInterface {
  public readonly name = 'OAuthHandler';

  @Inject(Generator)
  private readonly tokenGenerator: TokenGenerator;

  @InjectService(UserService)
  private readonly userService: UserService;

  private readonly registeredClients: Client[] = [
    {
      clientName: 'OAuth2-App',
      clientId: 'oauth-client-1',
      state: '',
      scope: 'user'
    }
  ];

  private readonly codes: any = {};

  private readonly requests: any = {};

  public async register(req: express.Request, res: express.Response): Promise<void> {}

  public async refresh(req: express.Request, res: express.Response): Promise<void> {}

  public async generateToken(req: express.Request, res: express.Response): Promise<void> {
    console.log('generateToken', req.body);
    const authorizationHeader = req.headers.authorization;
    let clientId;
    let clientSecret;
    let clientCredentials;
    let codeChallenge;

    if (!req.body.user_id) {
      this.sendError(res, 'Provide a user!');
      return;
    }

    if (authorizationHeader) {
      clientCredentials = this.decodeClientCredentials(authorizationHeader);
      clientId = clientCredentials.clientId;
      clientSecret = clientCredentials.clientSecret;
    }

    if (req.body.client_id) {
      if (clientId) {
        console.log('Client attempted to authenticate with multiple methods');
        res.status(401).json({ error: 'invalid client' });
        return;
      }

      const userId = req.body.user_id;
      clientId = req.body.client_id;
      const client = this.find<Client>(this.registeredClients, 'clientId', clientId);
      if (!client) {
        this.sendError(res, 'invalid client');
        return;
      }
      if (req.body.code_verifier) {
        codeChallenge = this.generateCodeChallenge(client.codeChallengeMethod, req.body.code_verifier);
        if (codeChallenge !== client.codeChallenge) {
          this.sendError(res, 'invalid code verifier');
          return;
        }
      } else {
        clientSecret = req.body.client_secret;
        if (clientSecret !== client.clientSecret) {
          this.sendError(res, 'invalid secret');
          return;
        }
      }

      if (req.body.grant_type !== 'authorization_code') {
        this.sendError(res, 'unsupported grant type');
        return;
      }

      const code = this.codes[req.body.code];
      if (code) {
        delete this.codes[req.body.code];

        const user = await this.userService.getUserByUserId(userId);
        if (!user) {
          this.sendError(res, 'Provide a user!');
          return;
        }
        const ticket = await this.tokenGenerator.createTicket(user);

        res
          .status(200)
          .cookie('oauthRefreshToken', ticket.cookie, { maxAge: 7200000, httpOnly: true, secure: false })
          .json({
            access_token: ticket.token,
            token_type: 'Bearer'
          });
      }
    }
  }

  public async authorize(req: express.Request, res: express.Response): Promise<void> {
    console.log('authorize callback', req.query);
    const queries = (req.query as unknown) as UrlOptions;
    if (!Object.keys(queries).length) {
      res.send('No query-parameter');
      return;
    }
    if (queries.response_type !== 'code') {
      res.send('Unsupported response type');
    }
    if (!queries.client_id) {
      res.send('No clientId provided');
      return;
    }
    const client = this.find<Client>(this.registeredClients, 'clientId', queries.client_id as string);
    if (client) {
      const reqid = this.generateRandomString();
      client.state = queries.state;
      if (queries.code_challenge) {
        client.codeChallenge = queries.code_challenge;
        client.codeChallengeMethod = queries.code_challenge_method;
      }
      client.redirectUri = queries.redirect_uri;

      this.requests[reqid] = queries;
      res.render('authorize', { client, reqid });
    }
  }

  public async approve(req: express.Request, res: express.Response): Promise<void> {
    console.log('approved body', req.body);

    const reqid = req.body.reqid;
    const query = this.requests[reqid];
    const user = await this.userService.getUserByCredentials(req.body.username, req.body.password);

    if (!query) {
      res.send('There is no matching request');
      return;
    }

    if (!user) {
      res.send('No user provided');
      return;
    }

    if (req.body.approve) {
      if (query.response_type === 'code') {
        const code = this.generateRandomString();
        this.codes[code] = { request: query };
        const urlParsed = this.buildUrl(query.redirect_uri, { code, state: query.state, user_id: user.userId });
        res.redirect(urlParsed);
        return;
      } else {
        const urlParsed = this.buildUrl(query.redirect_uri, { error: 'Unknown response type' });
        res.redirect(urlParsed);
        return;
      }
    } else {
      const urlParsed = this.buildUrl(query.redirect_uri, { error: 'Access denied!' });
      res.redirect(urlParsed);
      return;
    }
  }

  private find<T>(array: any[], param: keyof T, value: string): T {
    let result = {} as T;
    for (const entry of array) {
      if (entry[param] === value) {
        result = entry;
        break;
      }
    }
    return result;
  }

  private getScopes(scopeString: string): string[] {
    return scopeString.split(' ');
  }

  private generateRandomString(): string {
    return Modules.random();
  }

  private buildUrl(base: string, options?: any, hash?: string): string {
    const newUrl = url.parse(base, true);
    delete newUrl.search;
    if (!newUrl.query) {
      newUrl.query = {};
    }
    Object.keys(options).forEach(key => {
      newUrl.query[key] = options[key];
    });
    if (hash) {
      newUrl.hash = hash;
    }

    return url.format(newUrl);
  }

  private decodeClientCredentials(credentialsString: string): { clientId: string; clientSecret: string } {
    const credentials = Buffer.from(credentialsString.slice('basic '.length), 'base64')
      .toString()
      .split(':');
    return { clientId: credentials[0], clientSecret: credentials[1] };
  }

  private generateCodeChallenge(method: CodeChallengeMethod, codeVerifier: string): string {
    if (method) {
      return new shajs.sha256().update(codeVerifier).digest('hex');
    }
    return codeVerifier;
  }

  private sendError(res: express.Response, message: string): void {
    console.log(message);
    res.status(401).json({ error: message });
  }
}
