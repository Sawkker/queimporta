
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const incidents = await prisma.securityIncident.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5
    });
    console.log('--- Last 5 Security Incidents ---');
    console.log(JSON.stringify(incidents, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
