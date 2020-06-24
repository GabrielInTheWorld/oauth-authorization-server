import express from 'express';

import { InjectableClass } from '../../core/modules/decorators';

export class RouteHandlerInterface extends InjectableClass {
  public static readonly TOKEN_ISSUER = 'OpenSlides_Server';
  public static readonly CLIENT_PATH = 'client/dist/client';
  public static readonly VIEWS_PATH = 'views';

  public index: (request: express.Request, response: express.Response) => void;
  public login: (request: express.Request, response: express.Response) => Promise<void>;
  public whoAmI: (request: express.Request, response: express.Response) => Promise<void>;
  public logout: (request: express.Request, response: express.Response) => void;
  public notFound: (request: express.Request, response: express.Response) => Promise<void>;
}
