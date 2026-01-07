<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Alert from '$lib/components/ui/alert';
	import Icon from '@iconify/svelte';
	import { factionManagementScopes, factionInventoryScopes } from '$lib/utils/auth/admin-scopes';
	import { formatDistance } from 'date-fns';
	import { revokeCombineIntegration } from '$lib/remote/admin/revoke-combine-integration.remote';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleConnect() {
		if (data.authUrl) {
			window.location.href = data.authUrl;
		} else {
			console.error('OAuth is not configured - missing COMBINE_CLIENT_ID or COMBINE_CLIENT_SECRET');
		}
	}

	// Helper to check if a scope was granted
	function isScopeGranted(scope: string): boolean {
		return data.grantedScopes.includes(scope);
	}
</script>

<PageWrapper title="Combine Admin Integration">
	<div class="space-y-6">
		<!-- Connection Status Card -->
		<CardWrapper title="Connection Status">
			{#if data.isConnected}
				<div class="space-y-4">
					<div class="flex items-center gap-2">
						<Badge variant="default" class="bg-green-500/10 text-green-500 hover:bg-green-500/20">
							<Icon icon="lucide:check-circle" class="mr-1 size-3" />
							Connected
						</Badge>
						{#if data.isExpired}
							<Badge variant="destructive">
								<Icon icon="lucide:alert-triangle" class="mr-1 size-3" />
								Token Expired
							</Badge>
						{/if}
					</div>

					{#if data.expiresAt}
						<div class="text-sm text-muted-foreground">
							<span class="font-medium">Token expires:</span>
							{formatDistance(new Date(data.expiresAt), new Date(), { addSuffix: true })}
							<span class="text-xs">
								({new Date(data.expiresAt).toLocaleString()})
							</span>
						</div>
					{/if}

					<div class="text-sm text-muted-foreground">
						<span class="font-medium">Granted scopes:</span>
						{data.grantedScopes.length}
					</div>

					{#if data.isExpired}
						<Alert.Root variant="destructive">
							<Icon icon="lucide:alert-triangle" class="size-4" />
							<Alert.Title>Token Expired</Alert.Title>
							<Alert.Description>
								The access token has expired. Please reconnect to refresh the credentials.
							</Alert.Description>
						</Alert.Root>
					{/if}

					<div class="flex flex-col gap-2 sm:flex-row">
						<Button onclick={handleConnect} variant="outline" class="w-full sm:w-auto">
							<Icon icon="lucide:refresh-cw" class="mr-2 size-4" />
							Reconnect
						</Button>
						<Button
							onclick={async () => {
								await revokeCombineIntegration();
								await invalidate('app:admin:config:combine');
								toast.info('Combine integration disconnected.');
							}}
							variant="destructive"
							class="w-full sm:w-auto"
						>
							<Icon icon="lucide:unlink" class="mr-2 size-4" />
							Disconnect
						</Button>
					</div>
				</div>
			{:else}
				<div class="space-y-4">
					<div class="flex items-center gap-2">
						<Badge variant="destructive">
							<Icon icon="lucide:x-circle" class="mr-1 size-3" />
							Not Connected
						</Badge>
					</div>

					<p class="text-sm text-muted-foreground">
						Connect your Combine account with admin scopes to enable backend automation for faction
						management and inventory operations.
					</p>

					<Alert.Root variant="destructive">
						<Icon icon="lucide:info" class="size-4" />
						<Alert.Title>Admin Authentication Required</Alert.Title>
						<Alert.Description>
							<div class="grid gap-2">
								<span>
									This integration requires a high level of access to your Combine account. I'm
									talking about alot of access here. Please ensure you understand the implications
									before proceeding.
								</span>
								<span>
									If you made it to this page, you are either the Leader or Second in Command of the
									Unnamed Market faction. Only these roles are authorized to connect the Combine
									Admin Integration.
								</span>
							</div>
						</Alert.Description>
					</Alert.Root>

					<Button onclick={handleConnect} class="w-full sm:w-auto">
						<Icon icon="lucide:link" class="mr-2 size-4" />
						Connect Combine Account
					</Button>
				</div>
			{/if}
		</CardWrapper>

		<!-- Faction Management Scopes -->
		<CardWrapper title="Faction Management Scopes">
			<p class="mb-4 text-sm text-muted-foreground">
				These scopes allow the system to manage faction-level operations including credits, budgets,
				and datacards.
			</p>
			<div class="grid gap-3 sm:grid-cols-2">
				{#each factionManagementScopes as scope}
					<div class="flex items-start gap-3 rounded-lg border p-3">
						<div
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
						>
							<Icon icon={scope.icon} class="size-4 text-muted-foreground" />
						</div>
						<div class="flex-1 space-y-1">
							<div class="flex items-center gap-2">
								<p class="text-sm leading-none font-medium">{scope.name}</p>
								{#if data.isConnected}
									{#if isScopeGranted(scope.scope)}
										<Icon icon="lucide:check" class="size-3 text-green-500" />
									{:else}
										<Icon icon="lucide:x" class="size-3 text-muted-foreground" />
									{/if}
								{/if}
							</div>
							<p class="text-xs text-muted-foreground">{scope.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</CardWrapper>

		<!-- Faction Inventory Scopes -->
		<CardWrapper title="Faction Inventory Scopes">
			<p class="mb-4 text-sm text-muted-foreground">
				These scopes provide full access to faction-owned assets including ships, vehicles,
				facilities, and other entities.
			</p>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each factionInventoryScopes as scope}
					<div class="flex items-start gap-3 rounded-lg border p-3">
						<div
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
						>
							<Icon icon={scope.icon} class="size-4 text-muted-foreground" />
						</div>
						<div class="flex-1 space-y-1">
							<div class="flex items-center gap-2">
								<p class="text-sm leading-none font-medium">{scope.name}</p>
								{#if data.isConnected}
									{#if isScopeGranted(scope.scope)}
										<Icon icon="lucide:check" class="size-3 text-green-500" />
									{:else}
										<Icon icon="lucide:x" class="size-3 text-muted-foreground" />
									{/if}
								{/if}
							</div>
							<p class="text-xs text-muted-foreground">{scope.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</CardWrapper>

		<!-- Security Notice -->
		<Alert.Root>
			<Icon icon="lucide:shield-alert" class="size-4" />
			<Alert.Title>Security Notice</Alert.Title>
			<Alert.Description>
				These credentials provide extensive access to faction operations and are used by backend
				automation systems. Only connect with an account that has appropriate administrative
				permissions within your faction.
			</Alert.Description>
		</Alert.Root>
	</div>
</PageWrapper>
