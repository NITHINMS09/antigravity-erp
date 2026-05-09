import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@antigravity.com' },
    update: {},
    create: {
      email: 'admin@antigravity.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      phone: '9999999999',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Business configs
  await prisma.businessConfig.upsert({
    where: { businessCode: 'POWER_BRICK' },
    update: {},
    create: {
      businessName: 'POWER BRICK',
      businessCode: 'POWER_BRICK',
      invoicePrefix: 'PB',
      invoiceCounter: 0,
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
    },
  });
  await prisma.businessConfig.upsert({
    where: { businessCode: 'BAKE_LAND' },
    update: {},
    create: {
      businessName: 'BAKE LAND',
      businessCode: 'BAKE_LAND',
      invoicePrefix: 'BL',
      invoiceCounter: 0,
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
    },
  });
  console.log('✅ Business configs created');

  // Default materials for Power Brick
  const materials = [
    { name: '4 Inch Brick', code: '4IN_BRICK', unit: 'pieces', category: 'brick', defaultRate: 11, sortOrder: 1 },
    { name: '6 Inch Brick', code: '6IN_BRICK', unit: 'pieces', category: 'brick', defaultRate: 14, sortOrder: 2 },
    { name: 'Dust', code: 'DUST', unit: 'tons', category: 'aggregate', defaultRate: 800, sortOrder: 3 },
    { name: 'Double Wash', code: 'DOUBLE_WASH', unit: 'tons', category: 'aggregate', defaultRate: 1200, sortOrder: 4 },
    { name: 'Single Wash', code: 'SINGLE_WASH', unit: 'tons', category: 'aggregate', defaultRate: 900, sortOrder: 5 },
    { name: '20mm Jelly', code: '20MM_JELLY', unit: 'tons', category: 'aggregate', defaultRate: 1500, sortOrder: 6 },
    { name: '6mm Jelly', code: '6MM_JELLY', unit: 'tons', category: 'aggregate', defaultRate: 1800, sortOrder: 7 },
    { name: '40mm Jelly', code: '40MM_JELLY', unit: 'tons', category: 'aggregate', defaultRate: 1400, sortOrder: 8 },
    { name: 'Cement', code: 'CEMENT', unit: 'bags', category: 'cement', defaultRate: 380, sortOrder: 9 },
  ];

  for (const mat of materials) {
    const material = await prisma.material.upsert({
      where: { code: mat.code },
      update: {},
      create: mat,
    });
    await prisma.stock.upsert({
      where: { materialId: material.id },
      update: {},
      create: { materialId: material.id, quantity: 0, minLevel: 100 },
    });
  }
  console.log('✅ Default materials and stock created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
