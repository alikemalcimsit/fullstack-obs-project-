const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fn1 = await prisma.$queryRaw`SELECT dbo.BolumdekiOgrenciSayisi(1) AS sayi;`;
  const fn2 = await prisma.$queryRaw`SELECT dbo.OrtalamaAGNOBolum(1) AS agno;`;
  const view = await prisma.$queryRaw`SELECT TOP 3 * FROM dbo.BolumdekiOgrenciler;`;
  console.log({ fn1, fn2, view });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
