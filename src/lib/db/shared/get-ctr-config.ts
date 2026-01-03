import type { ChainTrustRatingKey } from "$lib/generated/prisma/enums";
import { db } from "../prisma"

/**
 * Get all CTR Config entries
 */
export const listCtrConfig = async () => {
  return await db.chainTrustRatingConfig.findMany();
}

/**
 * Get a single CTR Config entry by key
 * @param key {ChainTrustRatingKey}
 * @returns 
 */
export const getCtrConfig = async (key: ChainTrustRatingKey) => {
  return await db.chainTrustRatingConfig.findUnique({
    where: {
      key: key
    }
  });
}