<script lang="ts">
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import { Separator } from '$lib/components/ui/separator';
</script>

<PageWrapper title="Home">
	<div class="grid gap-3">
		<CardWrapper title="Unnamed Market" description="Welcome to the Holochain">
			<div class="grid gap-3">
				<div class="space-y-3">
					<h3>It's coming, I promise</h3>
					<p class="leading-relaxed">
						This experience is still under heavy development; over the coming days and weeks we will
						be fine-tuning critical flows to ensure everything feels seamless.
					</p>
					<ul class="list-disc space-y-1 pl-5">
						<li>Lot creation and editing</li>
						<li>Auction creation, editing, and management</li>
						<li>Notifications</li>
						<li>Discord account synchronization</li>
					</ul>
					<p class="leading-relaxed">…and much more on the way.</p>
				</div>

				<Separator />

				<div class="space-y-3">
					<h3>Questions / Comments</h3>
					<p class="leading-relaxed">
						Send all questions directly to Lucifer or Marcinius (Marc); they are tracking every
						request and will keep things moving.
					</p>
					<p class="leading-relaxed">
						Watch this space for coming updates—we’ll continue rolling out improvements as they’re
						ready.
					</p>
				</div>
			</div>

			{#snippet footer()}
				<div class="flex w-full justify-end">-Marc, Y26 D363</div>
			{/snippet}
		</CardWrapper>
	</div>
</PageWrapper>
