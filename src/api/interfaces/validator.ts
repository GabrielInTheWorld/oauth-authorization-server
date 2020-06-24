import express from 'express';

import { InjectableClass } from '../../core/modules/decorators';

export class Validator extends InjectableClass {
  public validateToken: (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
    expectedTokenName: string,
    issuer: string
  ) => express.Response | void;
}
