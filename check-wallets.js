const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWallets() {
  const wallets = await prisma.wallet.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      address: true,
      encryptedPrivateKey: true,
      imported: true,
      userId: true,
      createdAt: true
    }
  });
  
  console.log('Last 5 wallets:');
  wallets.forEach(w => {
    console.log(`\nWallet ${w.id}:`);
    console.log(`  Address: ${w.address}`);
    console.log(`  Has Private Key: ${w.encryptedPrivateKey ? 'YES' : 'NO'}`);
    console.log(`  Imported: ${w.imported}`);
    console.log(`  User ID: ${w.userId}`);
    console.log(`  Created: ${w.createdAt}`);
  });
  
  await prisma.$disconnect();
}

checkWallets().catch(console.error);
