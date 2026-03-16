import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // We read the token exclusively from the Bearer token in Auth header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // The exact same secret must match when generating the token
      secretOrKey:
        process.env.JWT_SECRET || 'llave-ultra-secreta-de-desarrollo-2024',
    });
  }

  async validate(payload: any) {
    // This payload is automatically injected to Request contexts downstream
    return { userId: payload.sub, email: payload.email, rol: payload.rol };
  }
}
