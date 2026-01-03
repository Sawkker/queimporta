import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IngestionService implements OnModuleInit {
    private readonly logger = new Logger(IngestionService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly prisma: PrismaService,
    ) { }

    async onModuleInit() {
        this.logger.debug('Running initial ingestion...');
        await this.handleCron();
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.debug('Starting ingestion job...');
        await this.fetchWeatherData();
        await this.fetchAirQualityData();
        // await this.simulateTransportData();
        // await this.simulateSecurityData();
    }

    async fetchWeatherData() {
        // Open-Meteo API for Buenos Aires
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816&hourly=temperature_2m,relativehumidity_2m';

        try {
            const { data } = await firstValueFrom(this.httpService.get(url));

            // Ensure "Open-Meteo" source exists
            let source = await this.prisma.datasetSource.findFirst({ where: { name: 'Open-Meteo' } });
            if (!source) {
                source = await this.prisma.datasetSource.create({
                    data: { name: 'Open-Meteo', url: 'https://open-meteo.com/', frequency: 'hourly' },
                });
            }

            // Ensure Metric exists
            let metric = await this.prisma.metric.findFirst({ where: { name: 'Temperature 2m', datasetSourceId: source.id } });
            if (!metric) {
                metric = await this.prisma.metric.create({
                    data: { name: 'Temperature 2m', unit: '°C', datasetSourceId: source.id },
                });
            }

            // Save the latest available data point (closest to now)
            const now = new Date();
            const timeArray = data.hourly.time as string[];
            let closestIndex = 0;
            let minDiff = Math.abs(new Date(timeArray[0]).getTime() - now.getTime());

            for (let i = 1; i < timeArray.length; i++) {
                const diff = Math.abs(new Date(timeArray[i]).getTime() - now.getTime());
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = i;
                }
            }

            const temp = data.hourly.temperature_2m[closestIndex];
            const time = data.hourly.time[closestIndex];

            await this.prisma.urbanData.create({
                data: {
                    metricId: metric.id,
                    value: { temp },
                    timestamp: new Date(time),
                },
            });

            this.logger.debug(`Weather data ingested: Temp ${temp}°C at ${time}`);
        } catch (error) {
            this.logger.error('Error ingesting weather data', error);
        }
    }

    async fetchAirQualityData() {
        const url = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-34.6037&longitude=-58.3816&hourly=pm2_5';

        try {
            const { data } = await firstValueFrom(this.httpService.get(url));

            let source = await this.prisma.datasetSource.findFirst({ where: { name: 'Open-Meteo Air Quality' } });
            if (!source) {
                source = await this.prisma.datasetSource.create({
                    data: { name: 'Open-Meteo Air Quality', url: 'https://open-meteo.com/en/docs/air-quality-api', frequency: 'hourly' },
                });
            }

            let metric = await this.prisma.metric.findFirst({ where: { name: 'PM2.5', datasetSourceId: source.id } });
            if (!metric) {
                metric = await this.prisma.metric.create({
                    data: { name: 'PM2.5', unit: 'μg/m³', datasetSourceId: source.id },
                });
            }

            const now = new Date();
            const timeArray = data.hourly.time as string[];
            let closestIndex = 0;
            let minDiff = Math.abs(new Date(timeArray[0]).getTime() - now.getTime());

            for (let i = 1; i < timeArray.length; i++) {
                const diff = Math.abs(new Date(timeArray[i]).getTime() - now.getTime());
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = i;
                }
            }

            const pm25 = data.hourly.pm2_5[closestIndex];
            const time = data.hourly.time[closestIndex];

            await this.prisma.urbanData.create({
                data: {
                    metricId: metric.id,
                    value: { pm25 },
                    timestamp: new Date(time),
                },
            });

            this.logger.debug(`Air Quality data ingested: PM2.5 ${pm25} at ${time}`);
        } catch (error) {
            this.logger.error('Error ingesting air quality data', error);
        }
    }

    async simulateTransportData() {
        try {
            let source = await this.prisma.datasetSource.findFirst({ where: { name: 'Transport Simulator' } });
            if (!source) {
                source = await this.prisma.datasetSource.create({
                    data: { name: 'Transport Simulator', url: 'internal', frequency: 'hourly' },
                });
            }

            // 1. Traffic Density
            let trafficMetric = await this.prisma.metric.findFirst({ where: { name: 'Traffic Density', datasetSourceId: source.id } });
            if (!trafficMetric) {
                trafficMetric = await this.prisma.metric.create({
                    data: { name: 'Traffic Density', unit: 'Index 0-100', datasetSourceId: source.id },
                });
            }

            const trafficValue = Math.floor(Math.random() * 100); // Random density
            await this.prisma.urbanData.create({
                data: {
                    metricId: trafficMetric.id,
                    value: { density: trafficValue },
                    timestamp: new Date(),
                },
            });

            // 2. Subway Status
            let subwayMetric = await this.prisma.metric.findFirst({ where: { name: 'Subway Status', datasetSourceId: source.id } });
            if (!subwayMetric) {
                subwayMetric = await this.prisma.metric.create({
                    data: { name: 'Subway Status', unit: 'Status', datasetSourceId: source.id },
                });
            }

            const statuses = ['Normal', 'Delayed', 'Normal', 'Normal', 'Service Interrupted'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            await this.prisma.urbanData.create({
                data: {
                    metricId: subwayMetric.id,
                    value: { status },
                    timestamp: new Date(),
                },
            });

            this.logger.debug(`Transport data simulated: Traffic ${trafficValue}, Subway ${status}`);

        } catch (error) {
            this.logger.error('Error simulating transport data', error);
        }
    }

    async simulateSecurityData() {
        // Disabled per user request (Official data ingestion used instead)
        /*
        try {
            let source = await this.prisma.datasetSource.findFirst({ where: { name: 'Security Simulator' } });
            // ... (rest of code)
        } catch (error) {
            this.logger.error('Error simulating security data', error);
        }
        */
    }
}
