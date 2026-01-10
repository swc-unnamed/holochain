<script lang="ts">
	import ResponsiveDialog from '../responsive-dialog/responsive-dialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import TextareaInput from '../fields/textarea-input/textarea-input.svelte';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';

	type Props = {
		label?: string;
	};

	let { label = 'Feedback' }: Props = $props();
	let showDialog = $state(false);
	let feedbackText = $state('');

	async function onSubmit() {
		// Sentry.captureFeedback({
		// 	message: feedbackText,
		// 	name: page.data.user.name,
		// 	source: 'bug-report.svelte',
		// 	url: page.url.pathname
		// });
	}
</script>

<Button variant="outline" size="sm" onclick={() => (showDialog = true)}>
	{label}
</Button>

{@render feedbackDialog()}

{#snippet feedbackDialog()}
	<ResponsiveDialog title="Provide Feedback" bind:open={showDialog}>
		<div class="grid gap-3">
			<p>
				Provide feedback directly to the Holochain team. Along with your message, we will
				automatically include some technical details to help us diagnose any issues. That is just
				your name, and the current page you're on.
			</p>

			<TextareaInput label="Feedback / Bug" bind:value={feedbackText} />
		</div>

		{#snippet footer()}
			<Button variant="secondary" size="sm" onclick={() => (showDialog = false)}>Cancel</Button>
			<Button
				size="sm"
				onclick={async () => {
					await onSubmit();
					showDialog = false;
					toast.info('Feedback sent', {
						description: 'Thank you for helping us improve Holochain'
					});
				}}
			>
				Send It
			</Button>
		{/snippet}
	</ResponsiveDialog>
{/snippet}
