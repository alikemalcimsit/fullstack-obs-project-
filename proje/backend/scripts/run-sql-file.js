const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function run() {
  const [, , fileArg] = process.argv;
  if (!fileArg) {
    console.error('Usage: node scripts/run-sql-file.js <sql-file-path>');
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }

  const content = fs.readFileSync(sqlPath, 'utf-8');
  // Split on lines containing only GO (case-insensitive)
  const statements = content
    .split(/^\s*GO\s*$/gim)
    .map((s) => s.trim())
    .filter(Boolean);

  const prisma = new PrismaClient();
  try {
    for (const [idx, stmt] of statements.entries()) {
      console.log(`Executing statement ${idx + 1}/${statements.length}...`);
      await prisma.$executeRawUnsafe(stmt);
    }
    console.log('All statements executed successfully.');
  } catch (err) {
    console.error('Failed while executing statements:', err);
    const current = statements
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .slice(0, 5)
      .join('\n---\n');
    console.error('First few statements were:\n', current);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
