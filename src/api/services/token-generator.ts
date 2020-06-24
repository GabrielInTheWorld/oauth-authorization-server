import cryptoRandomString from 'crypto-random-string';
import jwt from 'jsonwebtoken';

import { Keys } from '../../config';
import { Constructable } from '../../core/modules/decorators';
import { Generator, Response } from '../interfaces/generator';
import User from '../../core/models/user/user';

@Constructable(Generator)
export default class TokenGenerator implements Generator {
  public name = 'TokenGenerator';

  public async createTicket(user: User, issuer: string): Promise<Response> {
    if (!Object.keys(user).length) {
      throw new Error('user is empty.');
    }
    const sessionId = cryptoRandomString({ length: 32 });
    user.setSession(sessionId);
    const cookie = this.generateCookie(sessionId);
    const token = this.generateToken(sessionId, user, issuer);
    return { cookie, token, user };
  }

  public async renewTicket(cookie: string, sessionId: string, user: User, issuer: string): Promise<Response> {
    try {
      const token = this.generateToken(sessionId, user, issuer);
      return { token, cookie, user };
    } catch {
      throw new Error('Cookie has wrong format.');
    }
  }

  private generateToken(sessionId: string, user: User, issuer: string): string {
    const token = jwt.sign(
      { username: user.username, expiresIn: '10m', sessionId, userId: user.userId, issuer },
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
}
