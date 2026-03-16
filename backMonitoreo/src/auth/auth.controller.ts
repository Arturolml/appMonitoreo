import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // Bypasses the global JWT protection we will set up
  @UseGuards(AuthGuard('local')) // Intercepts the request and runs local.strategy.ts
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión para obtener Token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@admin.com' },
        password: { type: 'string', example: 'admin123' },
      },
    },
  })
  async login(@Request() req: any) {
    // req.user has already been validated and stripped by local.strategy.ts
    return this.authService.login(req.user);
  }
}
