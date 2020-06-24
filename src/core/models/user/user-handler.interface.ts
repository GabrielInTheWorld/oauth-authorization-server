import { InjectableClass } from 'src/core/modules/decorators';
import User from './user';

export class UserHandlerInterface extends InjectableClass {
  public getUserByCredentials: (username: string, password: string) => Promise<User | undefined>;
}
