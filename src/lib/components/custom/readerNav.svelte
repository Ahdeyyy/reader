<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import type { Book, NavItem } from 'epubjs';
	import {
		Gear,
		ListBullet,
		Square,
		ViewHorizontal,
		ViewNone,
		ViewVertical
	} from 'radix-icons-svelte';
	import { ArrowLeft } from 'radix-icons-svelte';
	import type { Snippet } from 'svelte';

	let { tableOfContents, book, flow, path, children } = $props<{
		tableOfContents: NavItem[];
		children: Snippet;
		flow: 'auto' | 'paginated' | 'scrolled-doc' | 'scrolled' | undefined;
		path: string;
		book: Book;
	}>();

	// console.log(flow);
</script>

<nav
	class="fixed left-0 top-0 z-50 flex w-full justify-between gap-3 bg-transparent p-1 backdrop-blur"
>
	<Sheet.Root>
		<Sheet.Trigger>
			<Button variant="outline">
				<ListBullet />
			</Button>
		</Sheet.Trigger>
		<Sheet.Content class="overflow-y-scroll" side="left">
			<Sheet.Header>
				<Sheet.Title>Table Of Contents</Sheet.Title>

				<ul>
					{#each tableOfContents as chapter}
						<li>
							<Button
								variant="link"
								on:click={async () => {
									book.rendition.display(chapter.href);
								}}
								class="font-semibold"
							>
								{chapter.label}
							</Button>
							<ul>
								{#each chapter.subitems || [] as item}
									<li class="px-6">
										<Button
											variant="link"
											on:click={async () => {
												book.rendition.display(item.href);
											}}
										>
											{item.label}
										</Button>

										{#each item.subitems || [] as subitem}
											<li class="px-8">
												<Button
													variant="link"
													on:click={async () => {
														book.rendition.display(subitem.href);
													}}
													class="text-sm"
												>
													{subitem.label}
												</Button>
											</li>
										{/each}
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			</Sheet.Header>
		</Sheet.Content>
	</Sheet.Root>
	<div>
		<Sheet.Root>
			<Sheet.Trigger>
				<Button variant="outline">
					<Gear />
				</Button>
			</Sheet.Trigger>
			<Sheet.Content class="overflow-y-scroll" side="right">
				<Sheet.Header>
					<Sheet.Title>Settings</Sheet.Title>
				</Sheet.Header>

				<div class="mb-4 mt-4 grid grid-cols-3 gap-3">
					<Button
						variant="ghost"
						on:click={() => {
							flow = 'auto';
							localStorage.setItem(`${path}-flow`, 'auto');
						}}
						class={flow === 'auto' ? 'ring-2' : ''}
					>
						<Square class="aspect-square w-6 md:w-12" />
					</Button>
					<Button
						variant="ghost"
						on:click={() => {
							flow = 'paginated';
							localStorage.setItem(`${path}-flow`, 'paginated');
						}}
						class={flow === 'paginated' ? 'ring-2' : ''}
					>
						<ViewVertical class="aspect-square w-6 md:w-12" />
					</Button>
					<Button
						variant="ghost"
						on:click={() => {
							flow = 'scrolled-doc';
							localStorage.setItem(`${path}-flow`, 'scrolled-doc');
						}}
						class={flow === 'scrolled-doc' ? 'ring-2' : ''}
					>
						<ViewHorizontal class="aspect-square w-6 md:w-12" />
					</Button>
				</div>
			</Sheet.Content>
		</Sheet.Root>

		<Button variant="ghost" href="/">
			<ArrowLeft class="aspect-square w-6 md:w-12" />
		</Button>
	</div>
</nav>

<div class="container relative mx-auto mt-6 p-4 md:p-6">
	{@render children()}
</div>
