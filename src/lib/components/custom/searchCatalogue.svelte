<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { type BookCard } from '$lib/store/types';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { getBookImgUrl } from '$lib/store/store.svelte';

	let { books } = $props<{ books: BookCard[] }>();
	let filtered_books = $state<BookCard[]>([]);
	let value = $state('');
	let open = $state(false);

	function search(e: InputEvent) {
		if (value == '') {
			filtered_books = [];
			return;
		}

		filtered_books = books.filter((book) => {
			return book.title.toLowerCase().includes(value) || book.author.toLowerCase().includes(value);
		});
	}

	$effect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}
		}
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={buttonVariants({
			variant: 'outline'
		})}
	>
		<p class="text-sm text-muted-foreground">
			Press
			<kbd
				class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-sm font-medium text-muted-foreground opacity-100"
			>
				<span class="text-sm">⌘</span> + j
			</kbd>
			to search
		</p>
	</Dialog.Trigger>
	<Dialog.Content class="grid gap-2 ">
		<Dialog.Header>
			<Dialog.Title>Search</Dialog.Title>
			<Input
				type="search"
				class="mb-4 mt-4"
				bind:value
				placeholder="search for a book"
				on:input={search}
			/>
			<section class="grid gap-3">
				{#each filtered_books as book}
					<article class="flex w-full items-center justify-between gap-4 p-2">
						<!-- {#await getBookImgUrl(book.url)}
							<Skeleton class="aspect-[200/250] h-24 " />
						{:then url}
							{#if url}
								<img class="aspect-[200/250] h-24 object-fill" src={url} alt="book cover" />
							{:else}
								<Skeleton class="aspect-[200/250] h-24" />
							{/if}
						{:catch error}
							<Skeleton class="aspect-[200/250] h-24" />
						{/await} -->
						<div class="grid gap-1">
							<p class="text-balance">{book.title}</p>
							<p class="text-sm text-gray-600">{book.author}</p>
						</div>
						<Button variant="default" href="/book{book.url}">read</Button>
					</article>
				{/each}
			</section>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
