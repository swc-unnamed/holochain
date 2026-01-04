<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { getUserInfoCard } from '$lib/remote/users/get-user-info-card.remote';
	import * as Avatar from '$lib/components/ui/avatar';
	import UserInfoCtr from './user-info-ctr.svelte';
	import Icon from '@iconify/svelte';
	import { standardDateFormat } from '$lib/utils/helpers/shared/date-formatter';
	import Item from '../item/item.svelte';
	import { Button } from '$lib/components/ui/button';
	type Props = {
		id: string;
	};

	let { id }: Props = $props();
</script>

<div>
	{#await getUserInfoCard(id)}
		<div class="flex items-center gap-2">
			<Skeleton class="h-10 w-10 rounded-md" />
			<Skeleton class="h-6 w-32 rounded-md" />
		</div>
	{:then user}
		<Item variant="outline">
			{#snippet title()}
				<div class="flex items-center gap-2">
					<Avatar.Root class="size-12">
						<Avatar.Image src={user.avatarUrl} />
						<Avatar.Fallback>{user.displayName.charAt(0)}</Avatar.Fallback>
					</Avatar.Root>

					<div class="flex flex-col justify-start">
						<span class="font-medium">{user.displayName}</span>
						<div class="flex flex-col gap-0">
							<div class="flex items-center gap-0 text-sm text-muted-foreground">
								<span>
									{#if user.role !== 'PATRON'}
										Staff
									{:else}
										Patron
									{/if}
								</span>
								<span><Icon icon="mdi:dot" /></span>
								<span>Chain initialized {standardDateFormat(user.createdAt)}</span>
							</div>
						</div>
					</div>
				</div>
			{/snippet}
			{#snippet footer()}
				<div class="flex items-center gap-1">
					<Button size="sm" variant="ghost">View Profile</Button>
				</div>
			{/snippet}

			{#snippet actionSnippet()}
				<div class="flex flex-col gap-2">
					<UserInfoCtr
						ctr={user.ctr}
						rootClass="flex-col gap-0 mt-3"
						iconClass="size-8"
						class="text-lg"
					/>
				</div>
			{/snippet}
		</Item>
	{/await}
</div>
