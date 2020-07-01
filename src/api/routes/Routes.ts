import * as express from 'express';

import { Inject, InjectService } from '../../core/modules/decorators';
import { OAuthHandler } from '../oauth/oauth-handler';
import { OAuthHandlerInterface } from '../oauth/oauth-handler-interface';
import RouteHandler from '../services/route-handler';
import { RouteHandlerInterface } from '../interfaces/route-handler-interface';
import SessionHandler from '../services/session-handler';
import TokenValidator from '../services/token-validator';
import { Validator } from '../interfaces/validator';

export default class Routes {
  private readonly SECURE_URL_PREFIX = '/api';

  @Inject(Validator)
  private readonly tokenValidator: TokenValidator;

  @Inject(RouteHandlerInterface)
  private readonly routeHandler: RouteHandler;

  @Inject(OAuthHandlerInterface)
  private readonly oauthHandler: OAuthHandler;

  @InjectService(SessionHandler)
  private readonly sessionHandler: SessionHandler;

  private readonly app: express.Application;

  public constructor(app: express.Application) {
    this.app = app;
  }

  public initRoutes(): void {
    this.configRoutes();
    this.initPublicRoutes();
    this.initApiRoutes();
  }

  private configRoutes(): void {
    this.app.all('*', (req, res, next) => {
      console.log('request', req.body);
      next();
    });
    this.app.all(
      `${this.SECURE_URL_PREFIX}/*`,
      (request, response, next) => this.tokenValidator.validateToken(request, response, next),
      (request, response, next) => this.sessionHandler.validateSession(request, response, next),
      (request, response, next) => {
        next();
      }
    );
  }

  private initPublicRoutes(): void {
    this.app.post('/login', (request, response) => this.routeHandler.login(request, response)); // Sends token
    this.app.get('/', (request, response) => this.routeHandler.index(request, response));
    this.app.post(
      '/who-am-i',
      (request, response, next) => this.sessionHandler.validateSession(request, response, next),
      (request, response) => this.routeHandler.whoAmI(request, response)
    );
  }

  private initApiRoutes(): void {
    this.app.get(this.getSecureUrl('/hello'), this.routeHandler.secureIndex);
    this.app.post(this.getSecureUrl('/logout'), (request, response) => this.routeHandler.logout(request, response));
    this.app.get(this.getSecureUrl('/list-sessions'), this.routeHandler.getListOfSessions);
    this.app.post(
      this.getSecureUrl('/clear-all-sessions-except-themselves'),
      this.routeHandler.clearAllSessionsExceptThemselves
    );
    this.app.post(this.getSecureUrl('/register-oauth'), (req, res) => this.oauthHandler.register(req, res));
    this.app.delete(this.getSecureUrl('/clear-session-by-id'), this.routeHandler.clearSessionById);

    /**
     * Routes for motions - only for presenting this app
     */
    this.app.get(this.getSecureUrl('/motions/all'), (req, res) => {
      this.routeHandler.getAllMotions(req, res);
    });
    this.app.post(this.getSecureUrl('/motions/get'), (req, res) => {
      console.log('/motions/get', req.body);
      this.routeHandler.getMotionById(req, res);
    });
    this.app.put(this.getSecureUrl('/motions/update'), (req, res) => {
      this.routeHandler.updateMotion(req, res);
    });
    this.app.post(this.getSecureUrl('/motions/create'), (req, res) => {
      this.routeHandler.createMotion(req, res);
    });
  }

  private getSecureUrl(urlPath: string): string {
    return `${this.SECURE_URL_PREFIX}${urlPath}`;
  }
}
