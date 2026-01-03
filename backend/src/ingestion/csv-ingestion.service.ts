
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

@Injectable()
export class CsvIngestionService {
    private readonly logger = new Logger(CsvIngestionService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly prisma: PrismaService,
    ) { }

    async ingestAllYears() {
        const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024]; // 2018-2024
        for (const year of years) {
            await this.ingestYear(year);
        }
        this.logger.log('All years ingested successfully.');
    }

    async ingestYear(year: number) {
        const url = `https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-justicia-y-seguridad/delitos/delitos_${year}.csv`;
        this.logger.log(`Starting ingestion for ${year} from ${url}...`);

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, { responseType: 'stream' }),
            );

            const stream = response.data.pipe(
                parse({ columns: true, delimiter: ',', relax_quotes: true }),
            );

            const batchSize = 1000;
            let batch = [];
            let count = 0;

            for await (const row of stream) {
                // Map CSV fields to Prisma model
                const incident = this.mapRow(row);
                if (incident) {
                    batch.push(incident);
                }

                if (batch.length >= batchSize) {
                    await this.prisma.securityIncident.createMany({ data: batch });
                    count += batch.length;
                    this.logger.debug(`Ingested ${count} records for ${year}`);
                    batch = [];
                }
            }

            // Final batch
            if (batch.length > 0) {
                await this.prisma.securityIncident.createMany({ data: batch });
                count += batch.length;
            }

            this.logger.log(`Finished ingestion for ${year}. Total records: ${count}`);

        } catch (error) {
            this.logger.error(`Failed to ingest ${year}`, error);
        }
    }

    private mapRow(row: any) {
        try {
            // Basic validation
            if (!row.latitud || !row.longitud || !row.fecha) return null;
            if (row.latitud === '0' || row.longitud === '0') return null;

            // Parse Lat/Lng
            const latitude = parseFloat(row.latitud);
            const longitude = parseFloat(row.longitud);
            if (isNaN(latitude) || isNaN(longitude)) return null;

            // Parse Timestamp
            // Format usually: 2023-01-01
            const timestamp = new Date(`${row.fecha}T${row.franja ? row.franja.padStart(2, '0') + ':00:00' : '12:00:00'}`);

            // Normalize Zone
            let zone = row.comuna ? `Comuna ${row.comuna}` : null;
            // Handle cases where "Comuna" is already in text or just a number
            if (row.comuna && !row.comuna.toLowerCase().includes('comuna')) {
                zone = `Comuna ${row.comuna}`;
            }

            return {
                type: row.tipo || 'Unknown',
                description: `${row.subtipo || ''} - ${row.barrio || ''}`.trim(),
                latitude,
                longitude,
                zone,
                timestamp,
            };
        } catch (e) {
            return null;
        }
    }
}
