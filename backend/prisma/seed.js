import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../api/utils/hash.js'; 

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const adminPassword = await hashPassword('admin123');

  // Create or update the ADMIN user
  // using 'upsert' to avoid duplicates and safely seed the database
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@college.com' }, 
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@college.com',
      password: adminPassword,
      role: 'ADMIN',
      department: 'IT', 
      verified: true,
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect Prisma Client
    await prisma.$disconnect();
  });
