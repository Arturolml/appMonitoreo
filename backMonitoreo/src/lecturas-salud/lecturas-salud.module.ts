import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LecturasSaludService } from './lecturas-salud.service';
import { LecturasSaludController } from './lecturas-salud.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LecturasSaludController],
  providers: [LecturasSaludService],
})
export class LecturasSaludModule {}
