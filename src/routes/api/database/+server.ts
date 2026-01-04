import { db } from '$lib/db/prisma.js'
import { json } from '@sveltejs/kit'

export const GET = async ({ locals, url }) => {
  if (!locals.apiClient || !locals.apiClient.scopes.includes('HOLOCHAIN_DATABASE_READ')) {
    return json({
      message: 'Client does not have the required scopes'
    }, { status: 401, statusText: 'Client does not have the required scopes' })
  }

  const page = Number(url.searchParams.get('page') || '1')
  const limit = Number(url.searchParams.get('limit') || '50')

  const count = await db.entity.count()

  const totalPages = Math.ceil(count / limit)
  if (page > totalPages && totalPages > 0) {
    return json({
      message: `Page ${page} does not exist. There are only ${totalPages} pages available.`
    }, { status: 400, statusText: `Page ${page} does not exist. There are only ${totalPages} pages available.` })
  }

  const entities = await db.entity.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      name: 'asc'
    },
    omit: {
      combineData: true,
    }
  });

  return json({
    data: entities,
    page: page,
    limit: limit,
    total: count,
    totalPages: totalPages
  })
}