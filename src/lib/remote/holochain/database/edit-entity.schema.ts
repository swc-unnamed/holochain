import { z } from 'zod/v4';

export const editEntitySchema = z.object({
	id: z.cuid2({ error: 'Not a valid ID' }),
	name: z.string({ error: 'Name is required' }),
	type: z.string({ error: 'Type is required' }),
	combineUid: z.string(),
	combineHref: z.url(),
	imageSmall: z.url(),
	imageLarge: z.url()
});
