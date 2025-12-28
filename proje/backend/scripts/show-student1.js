const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.ogrenci.findUnique({
    where: { id: 1 },
    select: {
      isim: true,
      soyad: true,
      dogumTarihi: true,
      cinsiyet: true,
      fotograf: true,
      mezuniyetTarihi: true,
    },
  });
  console.log(u);
}
main().finally(() => prisma.$disconnect());
