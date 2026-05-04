import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.fireProfile.upsert({
    where: { userId: 'default' },
    update: {},
    create: {
      annualExpense: 300000,
      safeWithdrawalRate: 0.04,
      fireTarget: 7500000,
    },
  });

  const categories = ['cash', 'fixed_income', 'equity', 'real_estate', 'crypto', 'precious', 'other'];
  for (const category of categories) {
    await prisma.allocationTarget.upsert({
      where: { userId_category: { userId: 'default', category } },
      update: {},
      create: { category, targetRatio: Math.round(100 / categories.length) },
    });
  }

  console.log('Seed data created');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
