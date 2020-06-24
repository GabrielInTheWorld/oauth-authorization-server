import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createServer, Server } from 'http';
import path from 'path';

import BaseServer from '../interfaces/base-server';
import { Constructable } from '../../core/modules/decorators';
import { OAuthRoutes } from '../oauth/oauth-routes';
import { RouteHandlerInterface } from '../interfaces/route-handler-interface';
import Routes from '../routes/Routes';

@Constructable(BaseServer)
export default class AuthenticationServer implements BaseServer {
  public static readonly ALLOWED_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:4200',
    'http://localhost:4210',
    'http://localhost:8010'
  ];

  public name = 'AuthenticationServer';

  private app: express.Application;
  private server: Server;
  private routes: Routes;
  private oauthRoutes: OAuthRoutes;
  private readonly port: number;

  public constructor(input: any) {
    this.port = input.port;
    this.createApp();
    this.createServer();
    this.initializeConfig();
    this.initializeRoutes();
    this.initClient();
  }

  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    this.server = createServer(this.app);
  }

  private initializeConfig(): void {
    this.app.use(
      (req, res, next) => this.corsFunction(req, res, next)
      // cors({
      //   allowedHeaders:
      //     'Origin, X-Requested-With, Content-Type, X-Content-Type, Authentication,
      //  Authorization, X-Access-Token, Accept',
      //   credentials: true,
      //   // origin: this.port === 8010 ? 'http://localhost:4210' : '*',
      //   // origin: '*',
      //   methods: 'OPTIONS, GET, POST, PUT, DELETE'
      // })
    );
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(cookieParser());
  }

  private initializeRoutes(): void {
    this.routes = new Routes(this.app);
    this.routes.initRoutes();
    this.oauthRoutes = new OAuthRoutes(this.app);
    this.oauthRoutes.initRoutes();
  }

  private initClient(): void {
    this.app.use('/', express.static(path.resolve(RouteHandlerInterface.VIEWS_PATH)));
    this.app.set('views', path.resolve(RouteHandlerInterface.VIEWS_PATH));
    this.app.set('view engine', 'jsx');
    this.app.engine('jsx', require('express-react-views').createEngine());
  }

  private corsFunction(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const requestingOrigin = req.headers.origin || '';
    if (AuthenticationServer.ALLOWED_ORIGINS.indexOf(requestingOrigin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', requestingOrigin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, DELETE, PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, X-Content-Type, Authentication, Authorization, X-Access-Token, Accept'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return next();
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): Server {
    return this.server;
  }
}
