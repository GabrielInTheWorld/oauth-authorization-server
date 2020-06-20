import express from 'express';

import { InjectableClass } from '../../core/modules/decorators';

export class OAuthHandlerInterface extends InjectableClass {
  public authorize: (request: express.Request, response: express.Response) => Promise<void>;
  // public callback: (request: express.Request, response: express.Response) => Promise<void>;
  public generateToken: (request: express.Request, response: express.Response) => Promise<void>;
}
