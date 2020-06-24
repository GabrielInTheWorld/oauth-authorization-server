import express from 'express';

import { InjectableClass } from '../../core/modules/decorators';

export class OAuthHandlerInterface extends InjectableClass {
  public static readonly TOKEN_ISSUER = 'OpenSlides_OAuth';

  public authorize: (request: express.Request, response: express.Response) => Promise<void>;
  public approve: (request: express.Request, response: express.Response) => Promise<void>;
  public generateToken: (request: express.Request, response: express.Response) => Promise<void>;
  public register: (request: express.Request, response: express.Response) => Promise<void>;
  public refresh: (request: express.Request, response: express.Response) => Promise<void>;
  public greeting: (request: express.Request, response: express.Response) => void;
}
