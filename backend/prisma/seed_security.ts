import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding security data...');

    // 1. Create Data Source
    let source = await prisma.datasetSource.findFirst({ where: { name: 'Security Historical' } });
    if (!source) {
        source = await prisma.datasetSource.create({
            data: { name: 'Security Historical', url: 'https://mapa.seguridadciudad.gob.ar/', frequency: 'annual' },
        });
        console.log('Created source: Security Historical');
    }

    // 2. Create Metric
    let metric = await prisma.metric.findFirst({ where: { name: 'Crime Count', datasetSourceId: source.id } });
    if (!metric) {
        metric = await prisma.metric.create({
            data: { name: 'Crime Count', unit: 'Incidents', datasetSourceId: source.id },
        });
        console.log('Created metric: Crime Count');
    }

    // 3. Seed Mock Historical Data (Simulating CSV Content)
    const zones = ['Palermo', 'Recoleta', 'Balvanera', 'Caballito', 'Belgrano', 'San Telmo', 'Flores'];
    const types = ['Robo con Violencia', 'Hurto', 'Robo Automotor'];
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Jan-Dec

    const entries = [];

    for (const zone of zones) {
        for (const month of months) {
            // Random number of crimes based on "danger" factor of zone (mock)
            let base = 50;
            if (zone === 'Palermo' || zone === 'Balvanera') base = 120;
            if (zone === 'Recoleta') base = 80;

            for (const type of types) {
                const count = Math.floor(base * (Math.random() * 0.5 + 0.8)); // Randomize slightly

                // Create date for 2024
                const date = new Date(2024, month, 15);

                entries.push({
                    metricId: metric.id,
                    timestamp: date,
                    value: { zone, type, count }
                });
            }
        }
    }

    console.log(`Generating ${entries.length} historical records...`);

    await prisma.urbanData.createMany({
        data: entries
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
