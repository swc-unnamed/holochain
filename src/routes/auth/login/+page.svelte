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

	let { data } = $props();
	let showAdminLogin = $state(false);
	let name = $state('');
	let showManualLogin = $state(false);

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
		class="pointer-events-none absolute inset-0 m-auto max-h-full max-w-full object-contain opacity-75 brightness-[0.25] grayscale select-none"
	/>

	<div class="relative w-full max-w-xl">
		<CardWrapper>
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
		</CardWrapper>
	</div>
</div>
