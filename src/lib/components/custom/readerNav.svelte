<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import type { Book, NavItem } from 'epubjs';
	import { ListBullet } from 'radix-icons-svelte';
	import { ArrowLeft } from 'radix-icons-svelte';

	let { tableOfContents, book, children } = $props<{
		tableOfContents: NavItem[];
		children;
		book: Book;
	}>();
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
							>
								{chapter.label}
							</Button>
							<ul>
								{#each chapter.subitems || [] as item}
									<li>
										<Button
											variant="link"
											on:click={async () => {
												book.rendition.display(item.href);
											}}
										>
											{item.label}
										</Button>
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			</Sheet.Header>
		</Sheet.Content>
	</Sheet.Root>
	<Button variant="ghost" href="/">
		<ArrowLeft class="aspect-square w-6 md:w-12" />
	</Button>
</nav>

<div class="container relative mx-auto mt-6 p-4 md:p-6">
	{@render children()}
</div>
