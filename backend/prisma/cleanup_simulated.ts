
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const simulatedTypes = ['Assault', 'Disturbance', 'Theft', 'Vandalism'];

    console.log(`Deleting records with types: ${simulatedTypes.join(', ')}`);

    const result = await prisma.securityIncident.deleteMany({
        where: {
            type: {
                in: simulatedTypes
            }
        }
    });

    console.log(`Deleted ${result.count} simulated records.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
