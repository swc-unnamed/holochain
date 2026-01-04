import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/lib/generated/prisma/client";

async function run() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const ctrConfigs = await prisma.chainTrustRatingConfig.findMany();

  // - For each user, add a CTR log for account creation
  const users = await prisma.user.findMany();
  const accountCreatedConfig = ctrConfigs.find(x => x.key === 'ACCOUNT_CREATED');
  const discordConfig = ctrConfigs.find(x => x.key === 'ACCOUNT_DISCORD_LINKED');
  const promotedConfig = ctrConfigs.find(x => x.key === 'ACCOUNT_ROLE_PROMOTED');

  for (const user of users) {
    if (accountCreatedConfig && accountCreatedConfig.points !== 0) {
      console.log(`Updating user ${user.name} for account creation CTR log`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ctr: { increment: accountCreatedConfig.points },
          ctrLogs: {
            create: {
              delta: accountCreatedConfig.points,
              event: 'ACCOUNT_CREATED',
              reason: accountCreatedConfig.reason
            }
          }
        }
      })
    }

    if (user.discordId && discordConfig && discordConfig.points !== 0) {
      console.log(`Updating user ${user.name} for discord linked CTR log`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ctr: { increment: discordConfig.points },
          ctrLogs: {
            create: {
              delta: discordConfig.points,
              event: 'ACCOUNT_DISCORD_LINKED',
              reason: discordConfig.reason
            }
          }
        }
      })
    }

    if (promotedConfig && promotedConfig.points !== 0 && user.role !== 'PATRON') {
      console.log(`Updating user ${user.name} for role promoted CTR log`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ctr: { increment: promotedConfig.points },
          ctrLogs: {
            create: {
              delta: promotedConfig.points,
              event: 'ACCOUNT_ROLE_PROMOTED',
              reason: promotedConfig.reason
            }
          }
        }
      })
    }
  }

  const lotCreatedCTR = ctrConfigs.find(x => x.key === 'AH_LOT_CREATED');
  const lotPurchasedCTR = ctrConfigs.find(x => x.key === 'AH_LOT_PURCHASED');

  const lots = await prisma.lot.findMany();

  for (const lot of lots) {
    if (lotCreatedCTR && lotCreatedCTR.points !== 0) {
      console.log(`Updating user ${lot.createdById} for lot created CTR log`);
      await prisma.user.update({
        where: { id: lot.createdById },
        data: {
          ctr: { increment: lotCreatedCTR.points },
          ctrLogs: {
            create: {
              delta: lotCreatedCTR.points,
              event: 'AH_LOT_CREATED',
              reason: lotCreatedCTR.reason
            }
          }
        }
      })
    }

    if (lotCreatedCTR && lotPurchasedCTR && lot.purchasedById && lotPurchasedCTR.points !== 0) {
      console.log(`Updating user ${lot.purchasedById} for lot purchased CTR log`);
      await prisma.user.update({
        where: { id: lot.purchasedById },
        data: {
          ctr: { increment: lotPurchasedCTR.points },
          ctrLogs: {
            create: {
              delta: lotPurchasedCTR.points,
              event: 'AH_LOT_PURCHASED',
              reason: lotPurchasedCTR.reason
            }
          }
        }
      })
    }
  }
}

run();