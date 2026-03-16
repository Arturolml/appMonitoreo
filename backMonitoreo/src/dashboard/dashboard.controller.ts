import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('resumen')
  @Roles('MEDICO', 'ENFERMERO')
  getSummary(@Req() req) {
    const doctorId = req.user.userId;
    return this.dashboardService.getSummary(doctorId);
  }
}
