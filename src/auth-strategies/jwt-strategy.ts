import {AuthenticationStrategy} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {verify} from 'jsonwebtoken';

export class JWTStrategy implements AuthenticationStrategy {
  name = 'jwt';

  constructor(
    @inject('authentication.jwt.secret') // Injecting the JWT secret bound in the application context
    private jwtSecret: string,
  ) { }

  async authenticate(request: Request): Promise<any | UserProfile | undefined> {
    const token: string = this.extractCredentials(request);
    // console.log("Token received by the request", token);

    try {
      const decodedToken: any = verify(token, this.jwtSecret); // Verify the token with the secret
      return {
        id: decodedToken.id,
        name: decodedToken.name,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  extractCredentials(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new Error('Authorization header not found');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Authorization header is not in the correct format');
    }

    return parts[1];
  }
}
