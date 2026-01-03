
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const types = await prisma.securityIncident.groupBy({
        by: ['type'],
        _count: {
            _all: true
        }
    });

    console.log('Distinct Types found:', types);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
