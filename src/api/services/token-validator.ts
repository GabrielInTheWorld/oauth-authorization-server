import express from 'express';
import jwt from 'jsonwebtoken';

import { Keys } from '../../config';
import { Constructable } from '../../core/modules/decorators';
import { Validator } from '../interfaces/validator';

@Constructable(Validator)
export default class TokenValidator implements Validator {
    public name = 'TokenValidator';

    private readonly token = 'token';

    public validateToken(
        request: any,
        response: express.Response,
        next: express.NextFunction
    ): express.Response | void {
        let token = (request.headers['x-access-token'] ||
            request.headers['authentication'] ||
            request.headers['authorization']) as string;
        if (!token) {
            return response.json({
                success: false,
                message: 'Auth token is not supplied'
            });
        }
        if (token.startsWith('Bearer')) {
            token = token.slice(7, token.length);
        }

        try {
            console.time('verify');
            request[this.token] = jwt.verify(token, Keys.privateKey());
            console.timeEnd('verify');
            next();
        } catch (e) {
            return response.json({
                success: false,
                message: `Token is not valid: ${e.message}`
            });
        }
    }
}
