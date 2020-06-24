import 'reflect-metadata';

import AuthenticationServer from './api/server/authentication-server';
import BaseServer from './api/interfaces/base-server';
import { Inject } from './core/modules/decorators';

export class Server {
  public static readonly PORT: number = parseInt(process.env.PORT || '', 10) || 8010;

  public get port(): number {
    return Server.PORT;
  }

  @Inject(BaseServer, { port: Server.PORT })
  private readonly httpServer: AuthenticationServer;

  public start(): void {
    this.httpServer.getServer().listen(Server.PORT, () => {
      console.log(`Server is running on port ${Server.PORT}`);
    });
  }
}

const server = new Server();
server.start();
