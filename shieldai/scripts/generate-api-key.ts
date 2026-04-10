/**
 * CLI tool to generate API keys.
 * Usage: npx ts-node scripts/generate-api-key.ts --customer-email demo@shield.ai --tier free
 */

import { PrismaClient } from '@prisma/client';

import { generateApiKey, hashApiKey, getKeyPrefix } from '../api/src/utils/crypto';

const prisma = new PrismaClient();

function parseArgs(): { email: string; tier: string; name: string } {
  const args = process.argv.slice(2);
  let email = '';
  let tier = 'free';
  let name = 'Default';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--customer-email' && args[i + 1]) {
      email = args[i + 1]!;
      i++;
    } else if (args[i] === '--tier' && args[i + 1]) {
      tier = args[i + 1]!;
      i++;
    } else if (args[i] === '--name' && args[i + 1]) {
      name = args[i + 1]!;
      i++;
    }
  }

  if (!email) {
    console.error('Usage: npx ts-node scripts/generate-api-key.ts --customer-email <email> [--tier <tier>] [--name <name>]');
    console.error('Tiers: free, starter, growth, enterprise');
    process.exit(1);
  }

  return { email, tier, name };
}

async function main(): Promise<void> {
  const { email, tier, name } = parseArgs();

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: { email },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: email.split('@')[0] ?? email,
        email,
        tier,
      },
    });
    console.log(`Created new customer: ${customer.name} (${customer.id})`);
  } else {
    console.log(`Found existing customer: ${customer.name} (${customer.id})`);
  }

  // Generate API key
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  await prisma.apiKey.create({
    data: {
      keyHash,
      keyPrefix,
      name,
      tier,
      customerId: customer.id,
    },
  });

  console.log('\n🔑 API Key Generated:');
  console.log(`   Key:      ${rawKey}`);
  console.log(`   Prefix:   ${keyPrefix}`);
  console.log(`   Tier:     ${tier}`);
  console.log(`   Customer: ${customer.email}`);
  console.log('\n⚠️  Save this key now — it cannot be retrieved later.\n');
}

main()
  .catch((err) => {
    console.error('Failed to generate API key:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
