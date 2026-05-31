const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('0000', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: '1234567' },
    update: {},
    create: {
      username: '1234567',
      passwordHash,
      role: 'admin',
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
