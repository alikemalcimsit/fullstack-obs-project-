const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updates = [
    { id: 1, dogumTarihi: new Date('1999-05-12'), cinsiyet: 'Erkek', fotograf: 'https://picsum.photos/seed/alikemal/200' },
    { id: 2, dogumTarihi: new Date('1998-11-03'), cinsiyet: 'Erkek', fotograf: 'https://picsum.photos/seed/sefa/200' },
    { id: 3, dogumTarihi: new Date('1999-08-25'), cinsiyet: 'Erkek', fotograf: 'https://picsum.photos/seed/mehmet/200' },
    { id: 4, dogumTarihi: new Date('2000-02-18'), cinsiyet: 'Kadın', fotograf: 'https://picsum.photos/seed/zeynep/200' },
  ];

  for (const u of updates) {
    const { id, ...data } = u;
    await prisma.ogrenci.update({ where: { id }, data });
    console.log(`Updated ogrenci ${id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
