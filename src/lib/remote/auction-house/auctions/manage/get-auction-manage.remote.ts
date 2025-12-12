import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/db/prisma";
import { guard } from "$lib/utils/auth/server-guard";
import { error } from "@sveltejs/kit";
import { getAuctionManageSchema } from "./get-auction-manage.schema";

export const getAuctionManage = query(getAuctionManageSchema, async (data) => {
  const { locals } = getRequestEvent();
  guard(locals, ["AUCTIONEER"]);

  const auction = await db.auction.findUnique({
    where: {
      id: data.id,
    },
    include: {
      lots: {
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
              entity: true
            }
          }
        }
      }
    }
  });

  if (!auction) {
    throw error(404, {
      message: 'Auction not found.'
    })
  }

  return auction;
})