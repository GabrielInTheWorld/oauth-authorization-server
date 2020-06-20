import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import Client from '../../core/models/client/client';
import { Keys } from '../../config';
import { Constructable } from '../../core/modules/decorators';
import { Cookie } from '../interfaces/generator';
import SessionHandlerInterface from '../interfaces/session-handler-interface';

@Constructable(SessionHandlerInterface)
export default class SessionHandler implements SessionHandlerInterface {
  public name = 'SessionHandler';

  private readonly cookie = 'cookie';

  private readonly activeSessions: Map<string, Client> = new Map();

  public validateSession(request: any, response: Response, next: NextFunction): Response | void {
    const refreshId = request.cookies['refreshId'] as string;
    console.log('validateSession', refreshId);
    try {
      const cookie = jwt.verify(refreshId, Keys.privateCookieKey()) as Cookie;
      if (!this.activeSessions.has(cookie.sessionId)) {
        return response.json({
          success: false,
          message: 'You are not signed in!'
        });
      }
      request[this.cookie] = cookie;
      next();
    } catch {
      response.json({
        success: false,
        message: 'No jwt provided'
      });
    }
  }

  public getAllActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  public clearSessionById(sessionId: string): boolean {
    if (this.activeSessions.has(sessionId)) {
      this.activeSessions.delete(sessionId);
      return true;
    } else {
      return false;
    }
  }

  public clearAllSessionsExceptThemselves(exceptSessionId: string): boolean {
    const sessions = this.getAllActiveSessions().filter(session => session !== exceptSessionId);
    for (const session of sessions) {
      this.activeSessions.delete(session);
    }
    return true;
  }

  public hasSession(sessionId: string): boolean {
    return this.activeSessions.has(sessionId);
  }

  public addSession(client: Client): boolean {
    if (!this.hasSession(client.sessionId)) {
      this.activeSessions.set(client.sessionId, client);
      return true;
    } else {
      return false;
    }
  }
}
