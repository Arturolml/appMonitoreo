import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertasService } from './alertas.service';
import { AlertasController } from './alertas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AlertasController],
  providers: [AlertasService],
})
export class AlertasModule {}
