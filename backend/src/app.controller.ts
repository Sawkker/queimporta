import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) { }

  @Get('data')
  async getData(@Query('metric') metricName?: string) {
    // If metric provided, filter by it. Otherwise return recent diverse data.
    if (metricName) {
      return this.prisma.urbanData.findMany({
        where: { metric: { name: metricName } },
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: { metric: true }
      });
    }

    return this.prisma.urbanData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: { metric: true }
    });
  }

  @Get('metrics')
  async getMetrics() {
    return this.prisma.metric.findMany();
  }

  @Get('incidents')
  async getIncidents() {
    return this.prisma.securityIncident.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }

  @Get('incidents/stats')
  async getIncidentStats(
    @Query('year') year?: string,
    @Query('zone') zone?: string,
  ) {
    const where: any = { zone: { not: null } };

    if (year && year !== 'All') {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      where.timestamp = { gte: start, lte: end };
    }

    if (zone && zone !== 'All') {
      where.zone = zone;
    }

    const stats = await (this.prisma as any).securityIncident.groupBy({
      by: ['zone'],
      _count: {
        _all: true,
      },
      where,
    });

    // Format as { "Comuna 1": 150, "Comuna 2": 200 ... }
    const result: Record<string, number> = {};
    stats.forEach((item: any) => {
      if (item.zone) {
        result[item.zone] = item._count._all;
      }
    });

    return result;
  }

  @Get('incidents/stats/type')
  async getIncidentStatsByType() {
    const stats = await (this.prisma as any).securityIncident.groupBy({
      by: ['type'],
      _count: {
        _all: true,
      },
    });

    // Format as { "Theft": 500, "Assault": 120 ... }
    const result: Record<string, number> = {};
    stats.forEach((item: any) => {
      if (item.type) {
        result[item.type] = item._count._all;
      }
    });

    return result;
  }

  @Get('incidents/locations')
  async getIncidentLocations(
    @Query('year') year?: string,
    @Query('zone') zone?: string,
  ) {
    const where: any = { zone: { not: null } };

    if (year && year !== 'All') {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      where.timestamp = { gte: start, lte: end };
    }

    if (zone && zone !== 'All') {
      where.zone = zone;
    }

    // optimizing: only fetch lat/lng
    const incidents = await this.prisma.securityIncident.findMany({
      where,
      select: {
        latitude: true,
        longitude: true,
      },
      take: 2000, // Limit for performance
    });

    return incidents.map(i => [i.latitude, i.longitude]);
  }
}
