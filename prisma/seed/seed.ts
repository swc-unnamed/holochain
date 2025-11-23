/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import { PrismaClient } from '../../src/lib/generated/prisma/client';
import { nanoid } from '../../src/lib/utils/helpers/shared/nanoid';
import { hash } from '../../src/lib/utils/encryption/hash';
import { PrismaPg } from '@prisma/adapter-pg';
import combineData from './entities.json' with { type: 'json' };

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
    const passwordHash = hash(process.env.SUPER_ADMIN_PASSWORD);
    await prisma.user.upsert({
      where: {
        name: 'um_admin',
      },
      create: {
        anonid: nanoid(),
        name: 'um_admin',
        displayName: 'Unnamed Admin',
        role: 'TZAR',
        passwordHash: passwordHash,
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
      update: {
        passwordHash: passwordHash
      }
    });

    console.log('Admin user "um_admin" has been created or updated.');
  } else {
    console.log('Admin user "um_admin" already exists. No action taken.');
  }

  await prisma.$disconnect();
}

seed();