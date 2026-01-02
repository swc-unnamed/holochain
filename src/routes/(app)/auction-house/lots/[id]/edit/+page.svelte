<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import SwitchInput from '$lib/components/custom/fields/switch-input/switch-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { getUserLot } from '$lib/remote/auction-house/lot/get-user-lot.remote';
	import { editLot } from '$lib/remote/auction-house/lot/edit-lot.remote';
	import { editLotSchema } from '$lib/remote/auction-house/lot/edit-lot.schema';
	import CreditInput from '$lib/components/custom/fields/credit-input/credit-input.svelte';

	let { data } = $props();
	const lot = $derived(await getUserLot({ id: data.id }));
	const cmd = new CommandForm(editLotSchema, {
		command: editLot,
		invalidate: 'auction-house:lot:edit',
		initial: () => ({
			id: lot.id,
			title: lot.title,
			details: lot.details,
			location: lot.location,
			anonLot: lot.anonLot,
			status: lot.status,
			startPrice: String(lot.startPrice ?? '')
				.replace(/,/g, '')
				.trim()
		}),
		onSuccess: async () => {
			toast.success('Lot updated');
			await goto(`/auction-house/lots/${lot.id}`);
		},
		onError: () => {
			toast.error('Failed to update lot');
		}
	});
</script>

<PageWrapper title={`Edit ${lot.title}`}>
	<div class="grid grid-cols-1 gap-3 lg:grid-cols-4">
		<div class="lg:col-span-3">
			<div class="grid gap-3">
				<CardWrapper title="Lot Details">
					{#snippet header()}
						<div class="flex items-center gap-2">
							<Badge>{lot.status}</Badge>
							<div class="text-sm text-muted-foreground">Lot #{lot.lotNumber}</div>
						</div>
					{/snippet}

					<div class="grid gap-3">
						<FieldInput label="Title" bind:value={cmd.form.title} required />
						<TextareaInput
							label="Details"
							description="Think of this as your sales pitch"
							bind:value={cmd.form.details}
							required
						/>
						<TextareaInput label="Location" bind:value={cmd.form.location} required />

						<SwitchInput
							label="Anonymous Listing"
							description="Hide your identity from bidders"
							bind:checked={cmd.form.anonLot}
						/>

						<FieldInput label="Status" value={cmd.form.status} readonly />
					</div>

					{#snippet footer()}
						<div class="flex w-full items-center justify-end gap-2">
							<Button variant="secondary" href="/auction-house/lots/{lot.id}">Cancel</Button>
							<Button onclick={cmd.submit} disabled={cmd.submitting}>
								{#if cmd.submitting}
									Saving…
								{:else}
									Save Changes
								{/if}
							</Button>
						</div>
					{/snippet}
				</CardWrapper>

				<CardWrapper title="Items">
					<div class="grid gap-3">
						{#if lot.items?.length < 1}
							<Empty title="No items" description="This lot has no items." />
						{:else}
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								{#each lot.items as item (item.id)}
									<div class="grid grid-cols-2 gap-2 rounded-md border p-2">
										<div class="grid gap-1">
											<img
												src={item.entity?.imageLarge ?? item.customImageUrl ?? ''}
												alt={item.name}
												class="aspect-square h-40 rounded-md border object-cover"
											/>
										</div>

										<div class="grid gap-2">
											<div class="font-medium">{item.name}</div>
											<div class="text-sm text-muted-foreground">Qty: {item.quantity}</div>
											<div class="flex flex-wrap items-center gap-2">
												{#if item.custom}
													<Badge>Custom</Badge>
												{/if}
												{#if item.batch}
													<Badge>Batch</Badge>
												{/if}
												{#if item.uuu}
													<Badge>UUU</Badge>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</CardWrapper>
			</div>
		</div>

		<div class="lg:col-span-1">
			<CardWrapper title="Meta">
				<div class="grid gap-3">
					<FieldInput label="Credits To" value={lot.creditsTo} readonly />
					<FieldInput
						label="Last Updated"
						value={new Date(lot.updatedAt).toLocaleString()}
						readonly
					/>
				</div>
			</CardWrapper>
		</div>
	</div>
</PageWrapper>
