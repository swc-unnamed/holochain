import { db } from "$lib/db/prisma"
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const entity = await db.entity.findUnique({
    where: { id: params.id }
  });

  if (!entity) {
    throw error(404, {
      message: `Entity with ID ${params.id} not found`
    })
  }

  return {
    entity: entity
  }
}