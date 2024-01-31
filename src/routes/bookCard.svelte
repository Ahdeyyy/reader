<script lang="ts">
	import { DotsVertical } from 'radix-icons-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { getBookImgUrl } from '$lib/store/store.svelte';
	import type { BookCard } from '$lib/store/types';

	const { book, removeBook, openAbout } = $props<{
		book: BookCard;
		removeBook: Function;
		openAbout: Function;
	}>();
</script>

<Card.Root class="relative flex h-96 flex-col items-center gap-3 self-center p-4 text-center">
	<Card.Content>
		{#await getBookImgUrl(book.title)}
			<Skeleton class="mx-auto mb-4 h-40 w-32" />
		{:then url}
			{#if url}
				<img
					class="mx-auto mb-4 aspect-[200/250] h-40 w-32 object-cover"
					height="250"
					width="200"
					src={url}
					alt="book cover"
				/>
			{:else}
				<Skeleton class="mx-auto mb-4 h-40 w-32" />
			{/if}
		{:catch error}
			<p>{error}</p>
		{/await}

		<h3 class="max-h-16 overflow-hidden text-balance text-center font-semibold">
			{book.title}
		</h3>
		<p class="mt-1 text-sm text-gray-500">{book.author}</p>
		<div class="absolute bottom-6 left-2 flex w-full justify-between p-4">
			<Button variant="default" href="/book{book.url}" class="w-3/4">Read</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<DotsVertical class="aspect-square w-6" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Item
							on:click={async () => {
								await openAbout(book.url);
							}}>About</DropdownMenu.Item
						>
						<DropdownMenu.Item
							on:click={async () => {
								await removeBook(book);
							}}>Remove</DropdownMenu.Item
						>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</Card.Content>
</Card.Root>
