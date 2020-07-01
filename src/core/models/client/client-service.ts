import { DatabasePort } from '../../../adapter/interfaces/database-port';
import DatabaseAdapter from '../../../adapter/services/database-adapter';
import { Constructable, Inject, InjectService } from '../../../core/modules/decorators';
import { Modules } from '../../../model-services/modules';
import { Client } from './client';
import { ClientServiceInterface } from './client-service.interface';

@Constructable(ClientServiceInterface)
export class ClientService {
  public name = 'ClientService';

  @Inject(DatabasePort, Client)
  private readonly database: DatabaseAdapter;

  private readonly clientCollection = new Map<string, Client>();

  public constructor() {
    this.init();
    // this.getAllClientsFromDatabase().then(clients => this.initClientCollection(clients));
  }

  public async create(appName: string, redirectUrl: string, appDescription: string = ''): Promise<Client> {
    console.log('promise16');
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
    console.log('promise17');
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

  private async init(): Promise<void> {
    try {
      await this.getAllClientsFromDatabase()
        .then(clients => this.initClientCollection(clients))
        .catch(e => console.log(e));
    } catch {
      console.log('error');
    }
  }

  private async getAllClientsFromDatabase(): Promise<Client[]> {
    console.log('promise18');
    return await this.database.getAll(Client.COLLECTIONSTRING);
  }

  private initClientCollection(clients: Client[]): void {
    for (const client of clients) {
      this.clientCollection.set(client.clientId, client);
    }
  }
}
