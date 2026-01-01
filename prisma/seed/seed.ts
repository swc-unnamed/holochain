/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import { PrismaClient } from '../../src/lib/generated/prisma/client';
import { nanoid } from '../../src/lib/utils/helpers/shared/nanoid';
import { PrismaPg } from '@prisma/adapter-pg';
import combineData from './entities.json' with { type: 'json' };
import { cwd } from 'node:process';

type CombineDataImport = {
  combine_entities: any[];
};

async function seed() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const data = combineData as CombineDataImport;
  const failedEntities: any[] = [];

  console.log(`Total entities to seed: ${data.combine_entities.length}`);

  for (const entity of data.combine_entities) {
    try {
      const record = await prisma.entity.upsert({
        where: {
          combineUid: entity.combine_uid,
        },
        create: {
          name: entity.name,
          type: entity.type,
          combineUid: entity.combine_uid,
          combineHref: entity.combine_href,
          combineData: entity.combine_data,
          imageLarge: entity.image_large,
          imageSmall: entity.image_small,
        },
        update: {
          name: entity.name,
          type: entity.type,
          combineHref: entity.combine_href,
          combineData: entity.combine_data,
          imageLarge: entity.image_large,
          imageSmall: entity.image_small
        }
      });
      console.log(`Seeded: ${record.name} with combine_uid ${record.combineUid}`);
    } catch (error) {
      console.error(`Failed to seed entity with combine_uid ${entity.combine_uid}:`, error);
      failedEntities.push(entity);
    }
  }

  if (failedEntities.length > 0) {
    console.error(`Failed to seed ${failedEntities.length} entities.`);
  } else {
    console.log('All entities seeded successfully.');
  }

  const adminUser = await prisma.user.findUnique({
    where: { name: 'um_admin' }
  });

  if (!adminUser) {
    if (!process.env.SUPER_ADMIN_PASSWORD) {
      throw new Error('SUPER_ADMIN_PASSWORD is not set in environment variables.');
    }
    await prisma.user.upsert({
      where: {
        name: 'um_admin',
      },
      create: {
        anonid: nanoid(),
        name: 'um_admin',
        displayName: 'Unnamed Admin',
        role: 'TZAR',
        preferences: {
          createMany: {
            data: [
              {
                key: 'GLOBAL_ANONYMOUS_MODE',
                value: 'false'
              },
              {
                key: 'GLOBAL_ENABLE_NOTIFICATIONS',
                value: 'false'
              },
              {
                key: 'GLOBAL_THEME_MODE',
                value: 'system'
              }
            ]
          }
        }
      },
      update: {}
    });

    console.log('Admin user "um_admin" has been created or updated.');
  } else {
    console.log('Admin user "um_admin" already exists. No action taken.');
  }

  await prisma.$disconnect();
}

async function seedPrices() {

  console.log('Seeding price data from CSV...');

  const path = cwd() + '/prisma/seed/price_seed.csv';
  const text = await Bun.file(path).text();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const toNum = (s?: string) => {
    if (s == null) return null;
    const cleaned = s.trim().replace(/[^0-9.-]/g, '');
    if (cleaned === '') return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  const rows = lines.map(line => {
    const parts = line.split(',').map(p => p.trim());
    const uid = parts[0] ?? '';
    const name = parts[1] ?? '';

    const avg = toNum(parts[2]);
    const min = toNum(parts[3]);
    const max = toNum(parts[4]);
    const last = toNum(parts[5]);

    return { uid, name, avg, min, max, last };
  });

  console.log(`Seeding ${rows.length} price records...`);

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const row of rows) {
    try {
      const entity = await prisma.entity.findUnique({
        where: {
          combineUid: row.uid
        }
      });
      if (!entity) {
        console.error(`Entity with combine_uid ${row.uid} not found. Skipping price seed.`);
        continue;

      }
      await prisma.entityTransaction.create({
        data: {
          entityId: entity.id,
          type: 'MARKETPLACE_PURCHASE',
          value: row.last?.toString() ?? '0',
          timestamp: new Date(),
        }
      });

      console.log(`Seeded last price for ${row.name} (${entity.id})`)
    } catch {
      console.error(`Failed to seed price for entity with combine_uid ${row.uid}`);
    }
  }
}

seed().then(() => {
  seedPrices();
})