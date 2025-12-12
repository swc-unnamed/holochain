import { db } from '$lib/db/prisma';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const { id } = params;

  const auction = await db.auction.findUnique({
    where: { id: id },
    include: {
      lots: {
        orderBy: { lotNumber: 'asc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              displayName: true,
              anonid: true
            }
          },
          items: {
            include: {
              entity: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  imageSmall: true,
                  imageLarge: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!auction) {
    throw error(404, {
      message: `Auction with ID ${id} not found`
    })
  }

  return {
    auction: auction
  }
}