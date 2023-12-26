<script lang="ts">
	import { Book } from 'epubjs';
	import {
		createCategoryItem,
		loadCategories,
		type Categories,
		type CategoryItem
	} from '$lib/store/store.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { open } from '@tauri-apps/api/dialog';
	import { convertFileSrc } from '@tauri-apps/api/tauri';

	type BookCard = {
		title: string;
		author: string;
		cover_url: string;
		description: string;
		url: string;
	};
	// categories
	const categories: Categories = loadCategories();
	const categoryItems = categories.value.map((category) => createCategoryItem(category));

	// a map of category names to their books

	let items = $state(loadItems());

	async function loadItems() {
		const items: Map<string, BookCard[]> = new Map();

		// I should probably do this once and persist for speed
		for (const category of categories.value) {
			const name = category;
			const item = createCategoryItem(name);
			const books: BookCard[] = [];
			for (const book_url of item.value) {
				const book = new Book(book_url);

				const metadata = await book.loaded.metadata;

				let cover_url = '';
				try {
					cover_url = (await book.coverUrl()) as string;
				} catch (e) {
					console.error(e);
				}
				books.push({
					title: metadata.title,
					author: metadata.creator,
					cover_url,
					description: metadata.description,
					url: new URL(book_url).pathname
				});
			}

			items.set(name, books);
		}
		// console.log(items);
		return items;
	}

	async function addBook(name: string) {
		let file_path: string | string[] | null;
		try {
			file_path = await open({
				multiple: false,
				filters: [
					{
						name: 'Epub',
						extensions: ['epub']
					}
				]
			});
		} catch (e) {
			console.error(e);
			file_path = '';
		}

		if (file_path) {
			const apiPath = convertFileSrc(file_path as string);
			const category = categoryItems.find((item) => item.name === name);
			if (category) {
				category.add(apiPath as string);
				items = loadItems();
			} else {
				console.error('category not found');
			}
		}
	}
</script>

<main class="container mx-auto p-8">
	{#await items}
		<p>Loading...</p>
	{:then i}
		{#each i as [category_name, books]}
			<section class="space-y-4">
				<div class="flex justify-between p-6">
					<h2 class="text-lg font-semibold capitalize md:text-2xl">{category_name}</h2>
					<Button
						on:click={async () => await addBook(category_name)}
						class="ml-auto border-b-2 border-r-2 border-primary shadow-md active:border-0 active:border-l-2 active:border-t-2"
						>Add Book</Button
					>
				</div>
				<div class="flex gap-3 space-x-4 overflow-x-auto p-4">
					{#each books as book}
						<Card.Root class="mx-auto aspect-video h-72 rounded-lg bg-white shadow-lg ">
							<div class="md:flex">
								<div class="md:flex-shrink-0">
									<img
										alt="Book cover"
										class="aspect-[400/600] h-48 w-full object-cover md:w-48"
										height="600"
										src={book.cover_url}
										width="400"
									/>
								</div>
								<div class="p-8">
									<Card.Header>
										<Card.Title class="mt-1 block text-base font-medium leading-tight text-primary">
											{book.title}
										</Card.Title>
										<Card.Description class="mt-2 text-base">{book.author}</Card.Description>
									</Card.Header>
									<Card.Content class="mt-2">
										<Button href="/book{book.url}" class="mt-4" variant="outline">Read</Button>
									</Card.Content>
								</div>
							</div>
						</Card.Root>

						<!-- <Card.Root class="flex flex-col items-center p-4 text-center">
							<Card.Content>
								{#if book.cover_url}
									<img
										class="mx-auto mb-4 aspect-[200/250] h-40 w-32 object-cover"
										height="250"
										width="200"
										src={book.cover_url}
										alt="book cover"
									/>
								{:else}
									<p>{book.description}</p>
								{/if}
								<h3 class="text-lg font-semibold">
									{book.title}
								</h3>
								<p class="mt-1 text-sm text-gray-500">{book.author}</p>
								<Button class="mt-auto" variant="outline" href="/{book.url}">Read</Button>
							</Card.Content>
						</Card.Root> -->
					{:else}
						<div class="flex gap-3 mt-8">
							<p class="text-gray-400">No books in this category</p>
							<Button
								on:click={async () => await addBook(category_name)}
								class="ml-auto shadow-md border-primary border-b-2 border-r-2 active:border-0 active:border-t-2 active:border-l-2"
								>Add Book</Button
							>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{:catch error}
		<p>{error.message}</p>
	{/await}
</main>
