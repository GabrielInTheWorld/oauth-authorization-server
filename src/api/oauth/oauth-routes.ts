import express from 'express';

import { Inject } from '../../core/modules/decorators';
import { OAuthHandler } from './oauth-handler';
import { OAuthHandlerInterface } from './oauth-handler-interface';

export class OAuthRoutes {
  private readonly app: express.Application;

  @Inject(OAuthHandlerInterface)
  private readonly oauthHandler: OAuthHandler;

  public constructor(app: express.Application) {
    this.app = app;
  }

  public initRoutes(): void {
    this.app.post('/token', (request, response) => this.oauthHandler.generateToken(request, response));
    this.app.get('/authorize', (request, response) => this.oauthHandler.authorize(request, response));
    this.app.post('/approve', (request, response) => this.oauthHandler.approve(request, response));
  }
}
