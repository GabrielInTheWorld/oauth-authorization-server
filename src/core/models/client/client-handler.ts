import path from 'path';

import { ClientHandlerInterface } from './client-handler.interface';
import { Constructable } from '../../../core/modules/decorators';

@Constructable(ClientHandlerInterface)
export class ClientHandler implements ClientHandlerInterface {
  public name = 'ClientHandler';

  public getClientRoute(): string {
    return path.join(path.resolve(ClientHandlerInterface.CLIENT_PATH), 'index.html');
  }
}
