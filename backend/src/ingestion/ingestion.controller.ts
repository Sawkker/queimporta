
import { Controller, Post, Query } from '@nestjs/common';
import { CsvIngestionService } from './csv-ingestion.service';

@Controller('ingestion')
export class IngestionController {
    constructor(private readonly csvService: CsvIngestionService) { }

    @Post('trigger-historical')
    async triggerHistorical(@Query('year') year?: string) {
        if (year) {
            // In background
            this.csvService.ingestYear(parseInt(year));
            return { message: `Started ingestion for ${year}` };
        } else {
            // In background all
            this.csvService.ingestAllYears();
            return { message: 'Started ingestion for all years (2018-2024)' };
        }
    }
}
