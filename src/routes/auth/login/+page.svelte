<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import RegisterForm from '$lib/components/auth/register-form.svelte';
	import FieldInput from '$lib/components/custom/fields/field-input/field-input.svelte';
	import { FieldSeparator } from '$lib/components/ui/field';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CommandForm } from '@akcodeworks/svelte-command-form';
	import { loginSchema } from '$lib/remote/auth/login.schema';
	import { login } from '$lib/remote/auth/login.remote';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import type { HttpError } from '@sveltejs/kit';
	import * as Terminal from '$lib/components/custom/terminal';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import ResponsiveDialog from '$lib/components/custom/responsive-dialog/responsive-dialog.svelte';

	let { data } = $props();
	let showAdminLogin = $state(false);
	let name = $state('');
	let showManualLogin = $state(false);

	let animationComplete = $state(false);

	let { form, submit } = $state(
		new CommandForm(loginSchema, {
			command: login,
			onSuccess: async (res) => {
				toast.success('Login successful');
				await goto('/home');
			},
			onError: (err) => {
				toast.error((err as HttpError).body.message || 'Login failed');
			}
		})
	);
</script>

<svelte:head>
	<title>Unnamed Market</title>
</svelte:head>

<div class="relative flex min-h-svh items-center justify-center bg-black p-6 md:p-10">
	<img
		src="/images/uim-animated.gif"
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 object-contain opacity-90 brightness-[0.35] grayscale select-none"
	/>

	<div class="relative z-10 h-1/2 w-1/2">
		<!-- <CardWrapper>
			<div class="grid gap-3">
				<div class="flex items-center justify-center">
					<div class="grid gap-3">
						<img src="/images/unnamed-banner.png" alt="logo" class="-mt-3" />
					</div>
				</div>

				{#if !data.requireCombineAuth}
					<form class="grid gap-3" onsubmit={submit}>
						<FieldInput label="Name" bind:value={form.name} />
						<FieldInput label="Password" type="password" bind:value={form.password} />
						<div class="grid grid-cols-2 gap-3">
							<Button class="w-full" type="submit" onclick={submit}>Login</Button>
							<Button href={data.combineAuthUrl} class="w-full" variant="outline">
								<Icon icon="mdi:fingerprint" />
								<span>Login with Combine</span>
							</Button>
						</div>
					</form>
				{:else}
					<div class="grid gap-3">
						<Button href={data.combineAuthUrl} class="w-full" variant="outline">
							<Icon icon="mdi:fingerprint" />
							<span>Login with Combine</span>
						</Button>
					</div>
				{/if}
			</div>
		</CardWrapper> -->

		<Terminal.Root
			class="bg-transparent/5"
			speed={2}
			onComplete={() => {
				animationComplete = true;
			}}
		>
			<Terminal.TypingAnimation class="text-center">Initializing uplink...</Terminal.TypingAnimation
			>
			<Terminal.Loading delay={1000} class="text-center">
				{#snippet loadingMessage()}
					Encrypting holostreams...
				{/snippet}
				{#snippet completeMessage()}
					<span>✔ Encryption verified</span>
				{/snippet}
			</Terminal.Loading>
			<Terminal.Loading delay={2000} class="text-center">
				{#snippet loadingMessage()}
					Verifying node status...
				{/snippet}
				{#snippet completeMessage()}
					<span>✔ Node status verifed</span>
				{/snippet}
			</Terminal.Loading>
			<Terminal.Loading delay={2450} class="text-center">
				{#snippet loadingMessage()}
					Loading chain data...
				{/snippet}
				{#snippet completeMessage()}
					<span class="text-red-500"> ✘ Error loading chain data </span>
				{/snippet}
			</Terminal.Loading>

			<Terminal.TypingAnimation delay={3000} class="text-center">
				Authentication required...
			</Terminal.TypingAnimation>

			<div class="mt-3 flex items-center justify-center">
				{#if animationComplete}
					<div in:fade={{ duration: 300 }}>
						<Button size="sm" href={data.combineAuthUrl}>
							Authenticate with Combine Biometrics
						</Button>
					</div>
				{/if}
			</div>
		</Terminal.Root>
	</div>
	<button
		class="absolute right-4 bottom-4 mb-1 hover:cursor-pointer hover:text-primary"
		onclick={() => (showAdminLogin = true)}>Admin Login</button
	>

	{@render adminLogin()}
</div>

{#snippet adminLogin()}
	<ResponsiveDialog title="Admin Login" bind:open={showAdminLogin}>
		<div class="grid gap-4">
			<h2 class="text-center text-lg font-semibold">Admin Login</h2>
			<form class="grid gap-3" onsubmit={submit}>
				<FieldInput label="Name" bind:value={form.name} />
				<FieldInput label="Password" type="password" bind:value={form.password} />
				<Button class="w-full" type="submit" onclick={submit}>Login</Button>
			</form>
		</div>
		{#snippet footer()}
			<div></div>
		{/snippet}
	</ResponsiveDialog>
{/snippet}
