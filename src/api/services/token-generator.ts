import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { uuid } from 'uuidv4';

import Client from '../../core/models/client/client';
import ClientService from '../../core/models/client/client-service';
import { ClientServiceInterface } from '../../core/models/client/client-service.interface';
import { Keys } from '../../config';
import { Constructable, Inject } from '../../core/modules/decorators';
import { Cookie, Generator, Response } from '../interfaces/generator';

@Constructable(Generator)
export default class TokenGenerator implements Generator {
    public name = 'TokenGenerator';

    @Inject(ClientServiceInterface)
    private readonly clientService: ClientService;

    public constructor() {
        this.init();
    }

    public async createTicket(username: string, password: string): Promise<Response> {
        const client = await this.clientService.getClientByCredentials(username, password);
        if (client) {
            const sessionId = uuid();
            const cookie = jwt.sign({ sessionId }, Keys.privateCookieKey(), { expiresIn: '1d' });
            client.setSession(sessionId);
            const token = this.generateToken(sessionId, client);
            return { cookie, token, client };
        } else {
            throw new Error('Client is not defined.');
        }
    }

    public async renewTicket(cookieAsString: string): Promise<Response> {
        try {
            const refreshId = this.verifyCookie(cookieAsString);
            const client = (await this.clientService.getClientBySessionId(refreshId.sessionId)) || ({} as Client);
            const token = this.generateToken(refreshId.sessionId, client);
            return { token, cookie: cookieAsString, client };
        } catch {
            throw new Error('Cookie has wrong format.');
        }
    }

    public verifyCookie(cookieAsString: string): Cookie {
        return jwt.verify(cookieAsString, Keys.privateCookieKey()) as Cookie;
    }

    private init(): void {
        this.insertMockData();
    }

    private generateToken(sessionId: string, client: Client): string {
        const token = jwt.sign(
            { username: client.username, expiresIn: '10m', sessionId, clientId: client.clientId },
            Keys.privateKey(),
            {
                expiresIn: '10m'
            }
        );
        return token;
    }

    private async insertMockData(): Promise<void> {
        if (this.clientService) {
            await this.clientService.create('admin', 'admin');
            await this.clientService.getClientByCredentials('admin', 'admin');
        }
    }
}
