/**
 * Styles for custom fields. Only to be used for items in the fields directory.
 */
export const STYLES = {
	input: {
		error: 'text-xs font-bold italic',
		label: 'font-bold flex items-center gap-1',
		description: 'mt-1'
	},
	checkboxOrToggle: {
		error: 'ml-9',
		checkbox: 'size-5 max-w-5',
		field: 'flex items-center gap-4'
	}
} as const;
