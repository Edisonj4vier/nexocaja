import { PrismaClient, UserStatus, ProductType, PersonType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed...');

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador del sistema',
    },
  });

  await prisma.role.upsert({
    where: { name: 'CASHIER' },
    update: {},
    create: {
      name: 'CASHIER',
      description: 'Cajero',
    },
  });

  await prisma.role.upsert({
    where: { name: 'CUSTOMER_SERVICE' },
    update: {},
    create: {
      name: 'CUSTOMER_SERVICE',
      description: 'Atención al cliente',
    },
  });

  const passwordHash = await bcrypt.hash('Admin123*', 10);

  await prisma.user.upsert({
    where: {
      email: 'admin@nexocaja.local',
    },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Sistema',
      email: 'admin@nexocaja.local',
      passwordHash,
      status: UserStatus.ACTIVE,
      roleId: adminRole.id,
    },
  });

  // Financial Products
  const products = [
    {
      code: 'AH-BASICA',
      name: 'Cuenta de Ahorros Básica',
      type: ProductType.SAVINGS,
      interestRate: 2.5,
      interestPeriodicity: 'MENSUAL',
      minOpeningAmount: 10,
      minBalance: 5,
      accountingAccount: '210101 - Depósitos de Ahorro',
      accountingInterest: '510201 - Gastos por Intereses de Ahorro',
      accountingCash: '110101 - Caja General',
      status: 'ACTIVE',
    },
    {
      code: 'AH-JUVENIL',
      name: 'Cuenta de Ahorros Juvenil',
      type: ProductType.SAVINGS,
      interestRate: 3.5,
      interestPeriodicity: 'MENSUAL',
      minOpeningAmount: 5,
      minBalance: 1,
      accountingAccount: '210102 - Depósitos de Ahorro Menores',
      accountingInterest: '510201 - Gastos por Intereses de Ahorro',
      accountingCash: '110101 - Caja General',
      status: 'ACTIVE',
    },
    {
      code: 'AH-PROG',
      name: 'Ahorro Programado Futuro',
      type: ProductType.PROGRAMMED_SAVINGS,
      interestRate: 5.0,
      interestPeriodicity: 'MENSUAL',
      minOpeningAmount: 25,
      minBalance: 25,
      accountingAccount: '210103 - Depósitos de Ahorro Programado',
      accountingInterest: '510202 - Gastos Intereses Ahorro Programado',
      accountingCash: '110101 - Caja General',
      status: 'ACTIVE',
    },
    {
      code: 'APORTACIONES',
      name: 'Cuenta de Aportaciones Sociales',
      type: ProductType.CONTRIBUTION,
      interestRate: 0.0,
      interestPeriodicity: 'ANUAL',
      minOpeningAmount: 20,
      minBalance: 20,
      accountingAccount: '310101 - Capital Social / Aportaciones',
      accountingInterest: null,
      accountingCash: '110101 - Caja General',
      status: 'ACTIVE',
    },
  ];

  for (const prod of products) {
    await prisma.financialProduct.upsert({
      where: { code: prod.code },
      update: prod,
      create: prod,
    });
  }

  // Update existing clients without memberCode
  const existingClients = await prisma.client.findMany({
    where: { memberCode: null },
    orderBy: { createdAt: 'asc' },
  });

  for (let i = 0; i < existingClients.length; i++) {
    const client = existingClients[i];
    const code = `SOC-${String(i + 1).padStart(6, '0')}`;
    await prisma.client.update({
      where: { id: client.id },
      data: {
        memberCode: code,
        personType: PersonType.NATURAL,
        nationality: 'Ecuatoriana',
        agency: 'Matriz',
      },
    });
  }

  console.log('✅ Seed finalizado con Productos Financieros y actualización de Socios');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
