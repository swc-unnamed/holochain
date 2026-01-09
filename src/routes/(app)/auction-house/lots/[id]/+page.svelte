<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import TextareaInput from '$lib/components/custom/fields/textarea-input/textarea-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Icon from '@iconify/svelte';
	import { toAbbrCurrency } from '$lib/utils/helpers/shared/currency';
	import UserInfoKarma from '$lib/components/custom/user-info/user-info-ctr.svelte';
	import UserInfo from '$lib/components/custom/user-info/user-info.svelte';
	import { toast } from 'svelte-sonner';
	import ResponsiveDialog from '$lib/components/custom/responsive-dialog/responsive-dialog.svelte';
	import { able } from '$lib/utils/auth/able.svelte.js';
	import CreditInput from '$lib/components/custom/fields/credit-input/credit-input.svelte';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { withdrawLotSchema } from '$lib/remote/auction-house/lot/withdraw-lot.schema.js';
	import { withdrawLot } from '$lib/remote/auction-house/lot/withdraw-lot.remote.js';
	import type { HttpError } from '@sveltejs/kit';
	import { withdrawLotAdminSchema } from '$lib/remote/auction-house/lot/withdraw-lot-admin.schema.js';
	import { withdrawLotAdmin } from '$lib/remote/auction-house/lot/withdraw-lot-admin.remote.js';
	import * as Tabs from '$lib/components/custom/underline-tabs';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import Empty from '$lib/components/custom/empty/empty.svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter.js';
	import { triggerCreditCheckpoint } from '$lib/remote/admin/combine/test.remote';

	const { data } = $props();
	const lot = $derived(data.lot);
	const anonData = $derived(data.anonData);
	const isOwner = $derived(data.isOwner || able('AUCTIONEER'));
	const transactions = $derived(data.entityTransactions);
	let showWithdrawDialog = $state(false);

	let canWithdraw = $derived(
		lot.status !== 'WITHDRAWN' && lot.status !== 'COMPLETED' && lot.status !== 'SOLD' && isOwner
	);

	const withdrawCmd = new CommandForm(withdrawLotSchema, {
		command: withdrawLot,
		initial: () => ({
			id: lot.id
		}),
		invalidate: 'ah:lot:id',
		onSuccess: () => {
			toast.success('Lot withdrawn successfully.');
			showWithdrawDialog = false;
		},
		onError: (err) => {
			const errMessage = (err as HttpError).body.message || 'Failed to withdraw lot.';
			toast.error(errMessage);
		}
	});

	const withdrawLotAdminCmd = new CommandForm(withdrawLotAdminSchema, {
		command: withdrawLotAdmin,
		initial: () => ({
			id: lot.id,
			noCtrImpact: false
		}),
		invalidate: 'ah:lot:id',
		onSuccess: () => {
			toast.success('Lot withdrawn successfully.');
			showWithdrawDialog = false;
		},
		onError: (err) => {
			const errMessage = (err as HttpError).body.message || 'Failed to withdraw lot.';
			toast.error(errMessage);
		}
	});
</script>

<PageWrapper title="Lot Details">
	<div class="grid grid-cols-1 gap-3 lg:grid-cols-5">
		<div class="lg:col-span-3">
			<div class="grid gap-3">
				<CardWrapper title={lot.title}>
					{#snippet header()}
						<Badge>{lot.status}</Badge>
					{/snippet}
					<div class="grid gap-3">
						<TextareaInput label="Details" value={lot.details} readonly />
						<TextareaInput label="Location" value={lot.location} readonly />
					</div>
				</CardWrapper>

				<CardWrapper title="Items">
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each lot.items as item (item.id)}
							{@const tx = transactions.find((tx) => tx.entityId === item.entityId)}
							<div class="grid grid-cols-2 gap-2 rounded-md border p-2">
								<div class="grid gap-1">
									<img
										src={item.entity.imageLarge}
										alt={item.name}
										class="aspect-square h-48 rounded-md border object-cover"
									/>
									<Button variant="link" size="sm" href="/holochain/database/{item.entityId}">
										<Icon icon="mdi:database-search" />
										<span>Holochain</span>
									</Button>
								</div>

								<div class="flex flex-col gap-2">
									<h5>{item.name}</h5>
									<p>Qty: {item.quantity}</p>

									{#if tx?.value}
										<p class="text-sm text-muted-foreground">
											Last Sold: {toAbbrCurrency(tx.value)}
										</p>
									{:else}
										<p class="text-sm text-muted-foreground">No Sales Data</p>
									{/if}
									<div class="flex items-center gap-2">
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
				</CardWrapper>
			</div>
		</div>

		<div class="lg:col-span-2">
			<CardWrapper title="Metadata">
				<Tabs.Root value="details">
					<Tabs.List>
						<Tabs.Trigger value="details">Details</Tabs.Trigger>
						<Tabs.Trigger value="activity">Activity</Tabs.Trigger>
						<Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="details">
						<div class="grid gap-3">
							<FieldInput
								label="Submitted At"
								value={new Date(lot.createdAt).toLocaleString()}
								readonly
							/>

							<CreditInput label="Starting Bid" value={lot.startPrice} readonly />

							<FieldInput label="Credits To" value={lot.creditsTo} readonly />

							{#if lot.createdBy}
								<div class="grid gap-2">
									<p class="text-sm font-bold">Submitted By</p>
									<UserInfo
										avatarUrl={lot.createdBy.avatarUrl!}
										displayName={lot.createdBy.displayName}
										ctr={lot.createdBy.ctr}
									/>
								</div>
							{:else}
								<FieldInput label="Listed By" value={anonData.sellerAnonId} readonly />
							{/if}

							{#if isOwner}
								<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
									{#if canWithdraw}
										<Button size="sm" variant="ghost" onclick={() => (showWithdrawDialog = true)}>
											Withdraw Lot
										</Button>
									{/if}

									{#if able('AUCTIONEER')}
										<Button size="sm" href="/auction-house/lots/{lot.id}/manage">
											<Icon icon="mdi:library-edit" />
											Manage Lot
										</Button>
									{/if}

									{#if able('AUCTIONEER')}
										<Button
											size="sm"
											variant="outline"
											onclick={async () => {
												await triggerCreditCheckpoint();
												toast.success('Chain status check initiated');
											}}
										>
											<Icon icon="mdi:code-block-braces" />
											Check Chain Status
										</Button>
									{/if}
								</div>
							{/if}
						</div>
						{@render withdrawLotDialog()}
					</Tabs.Content>

					<Tabs.Content value="activity">
						<ScrollArea class="h-96">
							{#if lot.history.length < 1}
								<Empty title="No Activity" description="No activity recorded for this lot yet" />
							{:else}
								<div class="grid gap-3 px-3">
									{#each lot.history as hx (hx.id)}
										<div class="grid gap-2 rounded-md border-2 border-border p-2">
											<span class="text-left text-xs">
												{standardDateFormat(hx.createdAt)}
											</span>
											<span class="text-sm">
												{hx.event}
											</span>
										</div>
									{/each}
								</div>
							{/if}
							<div
								class="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-card to-transparent pt-3"
							></div>
						</ScrollArea>
					</Tabs.Content>

					<Tabs.Content value="transactions">
						<ScrollArea class="h-96">
							{#if lot.transactions.length < 1}
								<Empty
									title="No Transactions"
									description="No Transactions have been minted yet"
									variant="loading"
								/>
							{:else}
								<div class="grid gap-3 px-3">
									{#each lot.transactions as tx (tx.id)}
										<div class="grid gap-2 rounded-md border-2 border-border p-2 text-sm">
											<span class="text-left text-xs text-muted-foreground">
												{standardDateFormat(new Date())}
											</span>
											<div class="grid grid-cols-2 items-center gap-2">
												<span>TX Hash</span>
												<span class="truncate">{tx.txHash}</span>
											</div>
											<div class="grid grid-cols-2 items-center gap-2">
												<span>Amount</span>
												<span class="truncate">{toAbbrCurrency(Number(tx.amount))}</span>
											</div>
											<div class="grid grid-cols-2 items-center gap-2">
												<span>Chain Status</span>
												{#if tx.completed}
													<Badge>Completed</Badge>
												{:else}
													<Badge variant="outline" class="bg-primary text-secondary">Pending</Badge>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</ScrollArea>
					</Tabs.Content>
				</Tabs.Root>
			</CardWrapper>
		</div>
	</div>
</PageWrapper>

{#snippet withdrawLotDialog()}
	<ResponsiveDialog title="Withdraw Lot?" bind:open={showWithdrawDialog}>
		<div class="grid gap-2">
			<p>
				Withdrawing this lot will remove it from the assigned Auction. Since this is already
				assinged to an Auction, withdrawing it will result in
				<span class="font-bold text-destructive"> -2 </span> Chain Trust Rating (CTR). Currently,
				you have a CTR of {lot.createdBy!.ctr}.
			</p>

			<p>Are you sure you want to proceed?</p>
		</div>

		{#snippet footer()}
			<div class="flex items-center gap-2">
				{#if able('AUCTIONEER')}
					<Button
						size="sm"
						variant="secondary"
						onclick={async () => {
							withdrawLotAdminCmd.form.noCtrImpact = true;
							await withdrawLotAdminCmd.submit();
						}}
						disabled={withdrawLotAdminCmd.submitting}
					>
						Withdraw and Retain CTR
					</Button>
				{/if}
				<Button size="sm" variant="secondary" onclick={() => (showWithdrawDialog = false)}>
					Cancel
				</Button>
				<Button size="sm" onclick={withdrawCmd.submit} disabled={withdrawCmd.submitting}>
					Withdraw Lot
				</Button>
			</div>
		{/snippet}
	</ResponsiveDialog>
{/snippet}
