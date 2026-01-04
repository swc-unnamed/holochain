import { db } from "$lib/db/prisma"
import { json } from "@sveltejs/kit"

export const GET = async ({ locals, params }) => {
  if (!locals.apiClient || !locals.apiClient.scopes.includes('HOLOCHAIN_DATABASE_READ')) {
    return json({
      message: 'Client does not have the required scopes'
    }, { status: 401, statusText: 'Client does not have the required scopes' })
  }

  if (!params.id) {
    return json({
      message: 'Missing entity ID'
    }, { status: 400, statusText: 'Missing entity ID' })
  }

  const entity = await db.entity.findUnique({
    where: {
      id: params.id
    },
    omit: {
      combineData: true,
    }
  });

  if (!entity) {
    return json({
      message: `Entity with ID ${params.id} not found`
    }, { status: 404, statusText: `Entity with ID ${params.id} not found` })
  }

  return json({
    ...entity
  })
}