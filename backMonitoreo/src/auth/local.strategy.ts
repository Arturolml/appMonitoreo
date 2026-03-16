import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Customize passport to use "email" and "password" instead of the default "username" mapping
    super({ usernameField: 'email' });
  }

  async validate(email: string, passwordHash: string): Promise<any> {
    // Validates directly with bcrypt if the login is perfectly valid
    const user = await this.authService.validarUsuario(email, passwordHash);

    if (!user) {
      // Automatically reject bad attempts from interceptor level
      throw new UnauthorizedException(
        'Credenciales incorrectas o usuario inactivo',
      );
    }

    // Returns the stripped user object to the request object req.user downstream
    return user;
  }
}
