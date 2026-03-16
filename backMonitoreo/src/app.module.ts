import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { DispositivosModule } from './dispositivos/dispositivos.module';
import { LecturasSaludModule } from './lecturas-salud/lecturas-salud.module';
import { UmbralesSaludModule } from './umbrales-salud/umbrales-salud.module';
import { AlertasModule } from './alertas/alertas.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    DispositivosModule,
    LecturasSaludModule,
    UmbralesSaludModule,
    AlertasModule,
    EvaluacionesModule,
    AuthModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // Globally locks all endpoints demanding Bearer token
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      // Globally checks the Roles metadata of the endpoint vs Bearer Payload
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
