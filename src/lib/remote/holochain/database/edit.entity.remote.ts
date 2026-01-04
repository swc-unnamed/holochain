import { command, getRequestEvent } from '$app/server';
import { db } from '$lib/db/prisma';
import { guard } from '$lib/utils/auth/server-guard';
import { error } from '@sveltejs/kit';
import { editEntitySchema } from './edit-entity.schema';

export const editEntity = command(editEntitySchema, async (data) => {
	const { locals } = getRequestEvent();
	guard(locals, ['DEVELOPER', 'TZAR']);

	const entityFound = await db.entity.findUnique({
		where: { id: data.id },
		select: { id: true }
	});

	if (!entityFound) throw error(404, { message: 'Entity Not Found' });
	const { id, ...rest } = data;
	const entity = await db.entity.update({
		where: {
			id: id
		},
		data: {
			...rest
		}
	});

	return entity;
});
