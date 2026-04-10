/**
 * Seed database with demo customer, API key, and rule versions.
 * Usage: npx ts-node scripts/seed-db.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import { generateApiKey, hashApiKey, getKeyPrefix } from '../api/src/utils/crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding ShieldAI database...\n');

  // 1. Create demo customer
  const customer = await prisma.customer.upsert({
    where: { email: 'demo@shield.ai' },
    update: {},
    create: {
      name: 'ShieldAI Demo',
      email: 'demo@shield.ai',
      company: 'ShieldAI',
      tier: 'enterprise',
    },
  });
  console.log(`✅ Customer created: ${customer.name} (${customer.id})`);

  // 2. Generate demo API key
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      keyHash,
      keyPrefix,
      name: 'Demo Key',
      tier: 'enterprise',
      customerId: customer.id,
    },
  });
  console.log(`✅ API key created: ${apiKey.id}`);
  console.log(`\n🔑 DEMO API KEY (save this — shown only once):`);
  console.log(`   ${rawKey}\n`);

  // 3. Load rules from YAML files into RuleVersion table
  const rulesDir = path.resolve(__dirname, '..', 'rules');
  if (fs.existsSync(rulesDir)) {
    const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.yaml'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(rulesDir, file), 'utf-8');
      const ruleFile = yaml.load(content) as {
        category: string;
        rules: unknown[];
      };

      if (ruleFile?.category && ruleFile?.rules) {
        await prisma.ruleVersion.upsert({
          where: {
            category_version: {
              category: ruleFile.category,
              version: 1,
            },
          },
          update: {
            rulesJson: ruleFile.rules as any,
            isActive: true,
          },
          create: {
            category: ruleFile.category,
            rulesJson: ruleFile.rules as any,
            version: 1,
            isActive: true,
          },
        });
        console.log(`✅ Rules loaded: ${file} (${ruleFile.rules.length} rules)`);
      }
    }
  } else {
    console.log('⚠️  Rules directory not found — skipping rule loading');
  }

  console.log('\n✨ Database seeded successfully!\n');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
