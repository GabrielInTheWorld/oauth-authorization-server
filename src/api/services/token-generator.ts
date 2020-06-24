import cookieParser from 'cookie-parser';
import cryptoRandomString from 'crypto-random-string';
import jwt from 'jsonwebtoken';

import { Keys } from '../../config';
import { Constructable, Inject } from '../../core/modules/decorators';
import { Cookie, Generator, Response } from '../interfaces/generator';
import User from '../../core/models/user/user';
import UserService from '../../core/models/user/user-service';
import { UserServiceInterface } from '../../core/models/user/user-service.interface';

@Constructable(Generator)
export default class TokenGenerator implements Generator {
  public name = 'TokenGenerator';

  // @Inject(UserServiceInterface)
  // private readonly userService: UserService;

  // public constructor() {
  //   // console.log('init TokenGenerator');
  //   this.init();
  // }

  public async createOAuthTicket(user: User): Promise<Response> {
    const sessionId = cryptoRandomString({ length: 32 });
    const cookie = jwt.sign({ sessionId }, Keys.privateCookieKey(), { expiresIn: '1d' });
    user.setSession(sessionId);
    const token = this.generateToken(sessionId, user);
    return { cookie, token, user };
  }

  public async createTicket(user: User): Promise<Response> {
    // const user = await this.userService.getUserByCredentials(username, password);
    console.log('user', user);
    if (!Object.keys(user).length) {
      throw new Error('user is empty.');
    }
    const sessionId = cryptoRandomString({ length: 32 });
    // const cookie = jwt.sign({ sessionId }, Keys.privateCookieKey(), { expiresIn: '1d' });
    user.setSession(sessionId);
    const cookie = this.generateCookie(sessionId);
    const token = this.generateToken(sessionId, user);
    return { cookie, token, user };
    // if (user) {
    // } else {
    //   throw new Error('User is not defined.');
    // }
  }

  public async renewTicket(cookie: string, sessionId: string, user: User): Promise<Response> {
    try {
      // const refreshId = this.verifyCookie(cookieAsString);
      // const user = (await this.userService.getUserBySessionId(refreshId.sessionId)) || ({} as User);
      const token = this.generateToken(sessionId, user);
      return { token, cookie, user };
    } catch {
      throw new Error('Cookie has wrong format.');
    }
  }

  // public verifyCookie(cookieAsString: string): Cookie {
  //   return jwt.verify(cookieAsString, Keys.privateCookieKey()) as Cookie;
  // }

  // private init(): void {
  //   // this.insertMockData();
  // }

  private generateToken(sessionId: string, user: User): string {
    const token = jwt.sign(
      { username: user.username, expiresIn: '10m', sessionId, userId: user.userId },
      Keys.privateKey(),
      {
        expiresIn: '10m'
      }
    );
    return token;
  }

  private generateCookie(sessionId: string): string {
    const cookie = jwt.sign({ sessionId }, Keys.privateCookieKey(), { expiresIn: '1d' });
    return cookie;
  }

  // private async insertMockData(): Promise<void> {
  //   if (this.userService) {
  //     await this.userService.create('demo', 'demo');
  //     await this.userService.getUserByCredentials('demo', 'demo');
  //   }
  // }
}
