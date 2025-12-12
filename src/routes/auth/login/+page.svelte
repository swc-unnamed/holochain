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

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10 dark:bg-black">
		<div class="flex justify-center gap-2 md:justify-start">
			<div class="flex items-center gap-2 font-medium">
				<div class="flex size-6 items-center justify-center rounded-md text-primary-foreground">
					<img src="/images/uim-18.png" class="size-4" alt="logo" />
				</div>
				Unnamed Market Holochain
			</div>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-3xl">
				<!-- <Tabs.Root value="login">
					<Tabs.List class="w-full">
						<Tabs.Trigger value="login">Login</Tabs.Trigger>
						<Tabs.Trigger value="register">Register</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="login">
						<form class="grid gap-4">
							<div class="flex flex-col items-center gap-1 text-center">
								<h1 class="text-2xl font-bold">Login to your account</h1>
								<p class="text-sm text-balance text-muted-foreground">
									Enter your name below to login to your account
								</p>
							</div>

							{#if !data.requireCombineAuth}
								<FieldInput label="Name" bind:value={form.name} />
								<FieldInput label="Password" type="password" bind:value={form.password} />

								<Button type="submit" onclick={submit}>Login</Button>
							{/if}
							{#if showAdminLogin}
								<FieldInput label="Name" bind:value={form.name} />
								<FieldInput label="Password" type="password" bind:value={form.password} />

								<Button type="submit" onclick={submit}>Login</Button>
							{/if}
							{#if data.combineAuthEnabled}
								{#if data.requireCombineAuth}
									<Button variant="outline" type="button" href={data.combineAuthUrl}>
										Continue with the Combine
									</Button>
									<Button variant="ghost" size="sm" onclick={() => (showAdminLogin = true)}>
										Login as Admin
									</Button>
								{:else}
									<FieldSeparator>or</FieldSeparator>
									<Button variant="outline" type="button" href={data.combineAuthUrl}>
										Login with the Combine
									</Button>
								{/if}
							{/if}
						</form>
					</Tabs.Content>
					<Tabs.Content value="register">
						<RegisterForm />
					</Tabs.Content>
				</Tabs.Root> -->

				<Terminal.Root delay={250}>
					<Terminal.AnimatedSpan>
						{`> holochain@um:unnamed-market/login$ ssh login.unnamed.market\n`}
					</Terminal.AnimatedSpan>

					<Terminal.Loading delay={2000}>
						{#snippet loadingMessage()}
							Securing connection...
						{/snippet}
						{#snippet completeMessage()}
							<span> ✔ Connection secured </span>
						{/snippet}
					</Terminal.Loading>
					<Terminal.Loading delay={3750}>
						{#snippet loadingMessage()}
							Checking galactic node status
						{/snippet}
						{#snippet completeMessage()}
							<span>✔ Node is live</span>
						{/snippet}
					</Terminal.Loading>
					<Terminal.Loading delay={5000}>
						{#snippet loadingMessage()}
							Getting most recent encryption protocols
						{/snippet}
						{#snippet completeMessage()}
							<span>✔ Protocols loaded</span>
						{/snippet}
					</Terminal.Loading>
					<Terminal.AnimatedSpan delay={6250}>
						<div class="flex flex-col gap-2">
							<span>Select Authentication Method</span>
							<div>
								<Button variant="secondary" size="sm" href={data.combineAuthUrl}
									>Combine Biometrics</Button
								>
								{#if !data.requireCombineAuth}
									<Button variant="secondary" size="sm" onclick={() => (showManualLogin = true)}
										>Manual</Button
									>
								{/if}
							</div>

							{#if showManualLogin}
								<div class="mt-4 grid grid-cols-2 gap-4">
									<FieldInput label="Name" bind:value={form.name} />
									<FieldInput label="Password" type="password" bind:value={form.password} />

									<div class="col-span-2">
										<Button class="w-full" variant="ghost" size="sm" onclick={submit}>Login</Button>
									</div>
								</div>
							{/if}
						</div>
					</Terminal.AnimatedSpan>
				</Terminal.Root>
			</div>
		</div>
	</div>
	<div class="relative hidden lg:block dark:bg-black">
		<img
			src="/images/uim-animated.gif"
			alt="placeholder"
			class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
