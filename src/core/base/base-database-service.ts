import { DatabasePort } from 'src/adapter/interfaces/database-port';
import DatabaseAdapter from 'src/adapter/services/database-adapter';

import { BaseModel } from './base-model';
import { Inject } from '../modules/decorators';

interface ModelConstructor {
  new: () => ModelConstructor;
}

export abstract class BaseDatabaseService<T, K extends BaseModel> {
  // @Inject(DatabasePort, {item: K})
  protected readonly database: DatabaseAdapter;

  // private item: () => K
}
