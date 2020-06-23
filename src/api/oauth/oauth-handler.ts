import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import qs from 'qs';
import querystring from 'querystring';
import randomstring from 'randomstring';
import shajs from 'sha.js';
import request from 'sync-request';
import url from 'url';

import { ClientHandler } from '../../core/models/client/client-handler';
import { ClientHandlerInterface } from '../../core/models/client/client-handler.interface';
import { Keys } from '../../config';
import { Constructable, InjectService, Inject } from '../../core/modules/decorators';
import GlobalStorage from '../../adapter/services/global-storage';
import { Modules } from '../../model-services/modules';
import { OAuthHandlerInterface } from './oauth-handler-interface';
import RouteHandler from '../services/route-handler';
import { Server } from '../..';

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

  @InjectService(GlobalStorage)
  private readonly storage: GlobalStorage;

  @Inject(ClientHandlerInterface)
  private readonly clientHandler: ClientHandler;

  private readonly registeredClients: Client[] = [
    {
      clientName: 'OpenSlides',
      clientId: 'oauth-client-1',
      state: '',
      scope: 'user'
    }
  ];

  private readonly codes: any = {};

  private readonly requests: any = {};

  public register(req: express.Request, res: express.Response): void {}

  public async generateToken(req: express.Request, res: express.Response): Promise<void> {
    const authorizationHeader = req.headers.authorization;
    let clientId;
    let clientSecret;
    let clientCredentials;
    let codeChallenge;

    if (authorizationHeader) {
      clientCredentials = this.decodeClientCredentials(authorizationHeader);
      clientId = clientCredentials.clientId;
      clientSecret = clientCredentials.clientSecret;
    }
    console.log('generateToken', req.body);

    if (req.body.client_id) {
      if (clientId) {
        console.log('Client attempted to authenticate with multiple methods');
        res.status(401).json({ error: 'invalid client' });
        return;
      }

      clientId = req.body.client_id;
      const client = this.find<Client>(this.registeredClients, 'clientId', clientId);
      console.log('client', client);
      if (!client) {
        this.sendError(res, 'invalid client');
        return;
      }
      if (req.body.code_verifier) {
        codeChallenge = this.generateCodeChallenge(client.codeChallengeMethod, req.body.code_verifier);
        console.log('codeChallenge', codeChallenge);
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
      console.log('received code', code);
      if (code) {
        delete this.codes[req.body.code];

        const accessToken = jwt.sign({ ...client, expiresIn: '15m' }, Keys.privateKey(), { expiresIn: '15m' });

        res.status(200).json({
          access_token: accessToken,
          token_type: 'Bearer'
        });
      }
    }

    // if (req.body.grant_type == 'authorization_code') {
    //   var code = codes[req.body.code];

    //   if (code) {
    //     delete codes[req.body.code]; // burn our code, it's been used
    //     if (code.request.client_id == clientId) {
    //       var access_token = randomstring.generate();
    //       var refresh_token = randomstring.generate();

    //       nosql.insert({ access_token: access_token, client_id: clientId, scope: code.scope });
    //       nosql.insert({ refresh_token: refresh_token, client_id: clientId, scope: code.scope });

    //       console.log('Issuing access token %s', access_token);

    //       var token_response = {
    //         access_token: access_token,
    //         token_type: 'Bearer',
    //         refresh_token: refresh_token,
    //         scope: code.scope.join(' ')
    //       };

    //       res.status(200).json(token_response);
    //       console.log('Issued tokens for code %s', req.body.code);

    //       return;
    //     } else {
    //       console.log('Client mismatch, expected %s got %s', code.request.client_id, clientId);
    //       res.status(400).json({ error: 'invalid_grant' });
    //       return;
    //     }
    //   } else {
    //     console.log('Unknown code, %s', req.body.code);
    //     res.status(400).json({ error: 'invalid_grant' });
    //     return;
    //   }
    // } else if (req.body.grant_type == 'refresh_token') {
    //   nosql.one(
    //     function(token) {
    //       if (token.refresh_token == req.body.refresh_token) {
    //         return token;
    //       }
    //     },
    //     function(err, token) {
    //       if (token) {
    //         console.log('We found a matching refresh token: %s', req.body.refresh_token);
    //         if (token.client_id != clientId) {
    //           nosql.remove(
    //             function(found) {
    //               return found == token;
    //             },
    //             function() {}
    //           );
    //           res.status(400).json({ error: 'invalid_grant' });
    //           return;
    //         }

    //         /*
    //          * Bonus: handle scopes for a refresh token request appropriately
    //          */

    //         var access_token = randomstring.generate();
    //         nosql.insert({ access_token: access_token, client_id: clientId });
    //         var token_response = {
    //           access_token: access_token,
    //           token_type: 'Bearer',
    //           refresh_token: token.refresh_token
    //         };
    //         res.status(200).json(token_response);
    //         return;
    //       } else {
    //         console.log('No matching token was found.');
    //         res.status(400).json({ error: 'invalid_grant' });
    //         return;
    //       }
    //     }
    //   );
    // } else {
    //   console.log('Unknown grant type %s', req.body.grant_type);
    //   res.status(400).json({ error: 'unsupported_grant_type' });
    // }
  }

  public async authorize(req: express.Request, res: express.Response): Promise<void> {
    console.log('authorize callback', req.body, req.query);
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
      // res.sendFile(this.clientHandler.getClientRoute());
      res.render('authorize', {
        client,
        reqid,
        onAuthenticate: (username: string, password: string) => this.authenticate(username, password)
      });
    }
  }

  public async approve(req: express.Request, res: express.Response): Promise<void> {
    console.log('approved body', req.body);

    const reqid = req.body.reqid;
    const query = this.requests[reqid];

    if (!query) {
      res.send('There is no matching request');
      return;
    }

    if (req.body.approve) {
      if (query.response_type === 'code') {
        const code = this.generateRandomString();
        this.codes[code] = { request: query };
        const urlParsed = this.buildUrl(query.redirect_uri, { code, state: query.state });
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

  private authenticate(username: string, password: string): void {
    console.log('username', username, password);
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
    console.log('generateCodeChallenge', method, codeVerifier);
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
