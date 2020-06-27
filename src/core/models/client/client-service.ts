import { DatabasePort } from 'src/adapter/interfaces/database-port';
import DatabaseAdapter from 'src/adapter/services/database-adapter';
import { Constructable, Inject } from 'src/core/modules/decorators';
import { Modules } from 'src/model-services/modules';

import { Client } from './client';
import { ClientServiceInterface } from './client-service.interface';

@Constructable(ClientServiceInterface)
export class ClientService {
  public name = 'ClientService';

  @Inject(DatabasePort, Client)
  private readonly database: DatabaseAdapter;

  private readonly clientCollection = new Map<string, Client>();

  public constructor() {
    this.getAllClientsFromDatabase().then(clients => this.initClientCollection(clients));
  }

  public async create(appName: string, redirectUrl: string, appDescription: string = ''): Promise<Client> {
    const id = Modules.random();
    const client = new Client({ appName, redirectUrl, appDescription });
    const done = await this.database.set(Client.COLLECTIONSTRING, id, client);
    if (done) {
      this.clientCollection.set(id, client);
    }
    return client;
  }

  public getClientById(clientId: string): Client | undefined {
    return this.getAllClients().find(client => client.clientId === clientId);
  }

  public hasClient(clientId: string): boolean {
    return !!this.getAllClients().find(client => client.clientId === clientId);
  }

  public async setClientSecret(clientId: string, clientSecret: string): Promise<void> {
    const client = this.getClientById(clientId);
    if (client) {
      client.clientSecret = clientSecret;
      this.clientCollection.set(clientId, client);
      await this.database.set(Client.COLLECTIONSTRING, clientId, client);
    }
  }

  public getAllClients(): Client[] {
    return Array.from(this.clientCollection.values());
  }

  private async getAllClientsFromDatabase(): Promise<Client[]> {
    return await this.database.getAll(Client.COLLECTIONSTRING);
  }

  private initClientCollection(clients: Client[]): void {
    for (const client of clients) {
      this.clientCollection.set(client.clientId, client);
    }
  }
}
