import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UmbralesSaludService } from './umbrales-salud.service';
import { UmbralesSaludController } from './umbrales-salud.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UmbralesSaludController],
  providers: [UmbralesSaludService],
})
export class UmbralesSaludModule {}
