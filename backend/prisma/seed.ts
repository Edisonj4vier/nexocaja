import { PrismaClient, UserStatus } from '@prisma/client';
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

  console.log('✅ Seed finalizado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
