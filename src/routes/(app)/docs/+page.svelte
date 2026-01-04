<script lang="ts">
	import CardWrapper from '$lib/components/custom/card-wrapper/card-wrapper.svelte';
	import Item from '$lib/components/custom/item/item.svelte';
	import PageWrapper from '$lib/components/custom/page-wrapper/page-wrapper.svelte';

	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
</script>

<PageWrapper title="Holochain Docs">
	<CardWrapper title="Holochain Docs">
		<div class="grid gap-3">
			<p class="text-sm text-muted-foreground">
				This is not the final form of the Holochain documentation. I'll create better docs at some
				point in the future.
			</p>

			<Accordion.Root type="single" class="w-full" value="item-2">
				<Accordion.Item value="item-1">
					<Accordion.Trigger>What is Chain Trust Rating (CTR)?</Accordion.Trigger>
					<Accordion.Content class="flex flex-col gap-4 text-balance">
						<p>
							Chain Trust Rating (CTR) is used to evaluate the reliability of users within the
							Holochain. Certain actions within the network will increase or decrease your CTR.
						</p>
						<p>
							As of right now, CTR is primarily influenced by the number of successful transactions
							and interactions you have within the Holochain ecosystem. A higher CTR indicates a
							more trustworthy user.
						</p>
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="item-2">
					<Accordion.Trigger>Roadmap</Accordion.Trigger>
					<Accordion.Content class="flex flex-col gap-4 text-balance">
						<p>
							This is not an exhaustive list of features planned for the holochain, but we strive
							for transparency and want to share our vision with the Galaxy. These are in no
							particular order and timelines are subject to change. But it should be coming soon ™️
						</p>

						<div class="grid gap-2">
							<Item title="Auction House - Initial Release" variant="muted">
								{#snippet footer()}
									<p>
										Initial Release of the Auction House and the first introduction to the
										Holochain.
									</p>
								{/snippet}

								{#snippet actionSnippet()}
									<Badge>In Progress</Badge>
								{/snippet}
							</Item>

							<Item title="Marketplace" variant="muted">
								{#snippet footer()}
									<p>
										Your standard marketplace where you can buy and sell items across the Galaxy.
										Deeply integrated with the Combine Holonet, we will strive to provide a seamless
										experience and allow you to connect as much as you like.
									</p>
								{/snippet}

								{#snippet actionSnippet()}
									<Badge variant="destructive">Pending</Badge>
								{/snippet}
							</Item>

							<Item title="Holochain API" variant="muted">
								{#snippet footer()}
									<p>
										We have no intention of becoming your only source for galactic commerce. We are
										planning to build an API that will allow other developers to reach into the
										Holochain and sync data with their own Holonets. This will of course come with a
										better documentation site as well.
									</p>
								{/snippet}

								{#snippet actionSnippet()}
									<Badge variant="destructive">Pending</Badge>
								{/snippet}
							</Item>

							<Item title="Organizations, Nodes, and more" variant="muted">
								{#snippet footer()}
									<div class="grid gap-2">
										<p>
											We plan to expand the Holochain to support Organizations, allowing groups of
											both factions and non-factions to create their own Node, completely seperate
											from the rest of the Holochain (if you want). This will allow for private
											marketplaces, auctions, and more.
										</p>

										<p>
											Nodes will also be introduced to allow users to carve out their own piece of
											the Holochain. These Nodes would allow for users to create their own rules,
											trade policies, inventory management, and more.
										</p>
									</div>
								{/snippet}

								{#snippet actionSnippet()}
									<Badge variant="destructive">Pending</Badge>
								{/snippet}
							</Item>

							<Item title="Unnamed Feature" variant="muted">
								{#snippet footer()}
									<p>
										Got an idea? We want to hear it. Once we get to a point where we have a stable
										Holochain, we will be opening up the platform for community suggestions and
										voting on new features. <br />

										<span class="text-muted-foreground">
											OOC: This is how I play the Combine, so I really have nothing else going on.
											-marc
										</span>
									</p>
								{/snippet}

								{#snippet actionSnippet()}
									<Badge variant="secondary">On Going</Badge>
								{/snippet}
							</Item>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	</CardWrapper>
</PageWrapper>
