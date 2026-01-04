import { db } from "$lib/db/prisma"

export const load = async () => {

  const [upcoming, active, previous] = await Promise.all([
    db.auction.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        _count: {
          select: {
            lots: true
          }
        }
      }
    }),
    db.auction.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        _count: {
          select: {
            lots: true
          }
        }
      }
    }),
    db.auction.findMany({
      where: {
        status: 'COMPLETED'
      },
      take: 4,
      orderBy: {
        completedAt: 'desc'
      },
      include: {
        _count: {
          select: {
            lots: true
          }
        }
      }
    })
  ]);

  return {
    upcomingAuctions: upcoming,
    activeAuctions: active,
    previousAuctions: previous
  }
}