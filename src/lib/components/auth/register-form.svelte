<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { registerAccount } from '$lib/remote/auth/register.remote';
	import { registerSchema } from '$lib/remote/auth/register.schema';
	import { commandForm } from '$lib/utils/remote/command-form.svelte';
	import { toast } from 'svelte-sonner';
	import FieldInput from '../custom/fields/field-input/field-input.svelte';
	import { goto } from '$app/navigation';
	import type { HttpError } from '@sveltejs/kit';

	let { form, submit } = $state(
		commandForm(registerSchema, {
			command: registerAccount,
			onSuccess: async (res) => {
				if (res.success) {
					toast.success(res.message);
					if (res.redirect) await goto(res.redirect);
				}
			},
			onError: (err) => {
				toast.error((err as HttpError).body.message || 'Registration failed');
			}
		})
	);
</script>

<div class="grid gap-3">
	<div class="flex flex-col items-center gap-1 text-center">
		<h1 class="text-2xl font-bold">Register a new account</h1>
		<p class="text-sm text-balance text-muted-foreground">
			Enter your name below to register your account
		</p>
	</div>

	<form class="grid gap-3">
		<FieldInput label="Name" bind:value={form.name} />
		<FieldInput label="Password" type="password" bind:value={form.password} />
		<FieldInput label="Confirm Password" type="password" bind:value={form.passwordConfirm} />

		<Button type="submit" onclick={submit}>Register</Button>
	</form>
</div>
