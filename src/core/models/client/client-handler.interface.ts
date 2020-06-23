import { InjectableClass } from '../../../core/modules/decorators';

export class ClientHandlerInterface extends InjectableClass {
  public static readonly CLIENT_PATH = 'client/dist/client';

  public getClientRoute: () => string;
}
