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

	let { data } = $props();
	let showAdminLogin = $state(false);

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
			<div class="w-full max-w-xs">
				<Tabs.Root value="login">
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
				</Tabs.Root>
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
