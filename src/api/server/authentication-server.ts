import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createServer, Server } from 'http';
import path from 'path';

import BaseServer from '../interfaces/base-server';
import { Constructable } from '../../core/modules/decorators';
import { OAuthRoutes } from '../oauth/oauth-routes';
import RouteHandler from '../services/route-handler';
import Routes from '../routes/Routes';

@Constructable(BaseServer)
export default class AuthenticationServer implements BaseServer {
  public name = 'AuthenticationServer';

  private app: express.Application;
  private server: Server;
  private routes: Routes;
  private oauthRoutes: OAuthRoutes;

  public constructor() {
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
    this.app.use(cors());
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
    this.app.use('/', express.static(path.resolve(RouteHandler.CLIENT_PATH)));
    this.app.use('/', express.static(path.resolve(RouteHandler.VIEWS_PATH)));
    this.app.set('views', path.resolve(RouteHandler.VIEWS_PATH));
    this.app.set('view engine', 'jsx');
    this.app.engine('jsx', require('express-react-views').createEngine());
    // this.app.all('/', (req, res) => res.sendFile(path.join(path.resolve(RouteHandler.CLIENT_PATH), 'index.html')));
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): Server {
    return this.server;
  }
}
