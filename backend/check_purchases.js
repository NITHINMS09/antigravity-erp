const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const purchases = await prisma.purchase.findMany({
    where: { business: 'BAKE_LAND' },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { items: true, supplier: true }
  });
  console.log(JSON.stringify(purchases, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
