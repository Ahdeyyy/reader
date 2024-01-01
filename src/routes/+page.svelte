<script lang="ts">
	import { Book } from 'epubjs';
	import { DotsVertical, Plus } from 'radix-icons-svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { open } from '@tauri-apps/api/dialog';
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { confirm } from '@tauri-apps/api/dialog';

	import HomeNav from '$lib/components/custom/homeNav.svelte';
	import {
		getBookStore,
		getCatalogueStore,
		type CatalogueStore,
		type BookStore,
		urlImageToBlob,
		blobToUrlImage,
		getBookImgUrl,
		fixUrl
	} from '$lib/store/store.svelte';
	import type { BookCard, Catalogue } from '$lib/store/types';
	import { createToaster, melt } from '@melt-ui/svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { Cross1 } from 'radix-icons-svelte';
	import SearchCatalogue from '$lib/components/custom/searchCatalogue.svelte';

	type ToastData = {
		title: string;
		description: string;
		color: string;
	};

	const {
		elements: { content, title, description, close },
		helpers: { addToast },
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>();

	let bookStore: Awaited<BookStore> | undefined = $state(undefined);
	let catalogueStore: Awaited<CatalogueStore> | undefined = $state(undefined);
	let aboutBook = $state({
		title: '',
		cover_url: '',
		description: '',
		author: '',
		publisher: '',
		year: '',
		language: '',
		url: '',
		rights: ''
	});
	let openCommand = $state(false);
	type AboutBookKeys = keyof typeof aboutBook;

	getBookStore().then((store) => {
		bookStore = store;
		// console.log(bookStore.value[0]);
	});

	getCatalogueStore().then((store) => {
		catalogueStore = store;
		// console.log(catalogueStore);
	});

	async function addBook(catalogue_id: number) {
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
			const t_file_path = convertFileSrc(file_path as string);

			const epub_book = new Book(t_file_path);
			const book_cover = await epub_book.coverUrl();
			const book_url = new URL(t_file_path).pathname;
			const metadata = await epub_book.loaded.metadata;

			const book: BookCard = {
				title: metadata.title,
				author: metadata.creator,
				cover: book_cover ?? '',
				description: metadata.description,
				url: book_url,
				catalogue_id: catalogue_id
			};

			const status = await bookStore!.add(book);
			addToast({
				data: {
					title: status.status,
					description: status.message,
					color: status.status === 'success' ? 'green-500' : 'red-500'
				}
			});
		}
	}

	async function removeBook(book: BookCard) {
		const confirmed2 = await confirm('This action cannot be reverted. Are you sure?', {
			title: `Remove ${book.title}`,
			type: 'warning'
		});
		if (!confirmed2) return;
		const status = await bookStore!.remove(book);
		addToast({
			data: {
				title: status.status,
				description: status.message,
				color: status.status === 'success' ? 'green-500' : 'red-500'
			}
		});
	}

	let openDialog = $state(false);
	async function openAbout(book_path: string) {
		openDialog = true;
		const book = new Book(convertFileSrc(fixUrl(book_path)));
		const metadata = await book.loaded.metadata;
		const cover_url = await book.coverUrl();
		// console.log((await book.loaded.navigation).toc);

		const description = metadata.description;
		aboutBook.title = metadata.title;
		aboutBook.cover_url = cover_url ?? '';
		aboutBook.description = description;
		aboutBook.author = metadata.creator;
		aboutBook.publisher = metadata.publisher || 'Unknown';
		aboutBook.url = book_path;
		aboutBook.rights = metadata.rights || 'Unknown';
		if (metadata.pubdate === '') {
			aboutBook.year = 'Unknown';
		} else {
			const date = new Date(metadata.pubdate);
			aboutBook.year =
				date.getFullYear().toString() +
				'-' +
				(date.getMonth() + 1).toString() +
				'-' +
				date.getDate().toString();
		}
		aboutBook.language = metadata.language;
	}

	$effect(() => {
		if (!openDialog) {
			for (const keys of Object.keys(aboutBook) as AboutBookKeys[]) {
				aboutBook[keys] = '';
			}
		}

		// console.log(openCommand);

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				openCommand = !openCommand;
			}
		}
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	let currentTab = $state('1');
</script>

<HomeNav>
	<main class="">
		<Tabs.Root bind:value={currentTab} class="w-full">
			<Tabs.List class="flex w-full flex-nowrap justify-start gap-2 overflow-x-auto">
				{#each catalogueStore?.value! as catalogue}
					<Tabs.Trigger value={catalogue.id!.toString()}>{catalogue.title}</Tabs.Trigger>
				{/each}
			</Tabs.List>
			{#each catalogueStore?.value! as catalogue}
				<Tabs.Content value={catalogue.id!.toString()}>
					<section class="">
						<div class="mb-4 mt-2 flex items-center justify-between gap-3 self-center py-3">
							{#if currentTab === catalogue.id!.toString()}
								<SearchCatalogue books={bookStore?.getByCatalogue(catalogue.id!) || []} />
							{/if}
							<Button on:click={async () => await addBook(catalogue.id!)} variant="ghost" class="">
								<Plus class="aspect-square w-6 stroke-2" />
							</Button>
						</div>
						<div class="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-4">
							{#each bookStore?.getByCatalogue(catalogue.id!) || [] as book}
								<Card.Root
									class="relative flex h-96 flex-col items-center gap-3 self-center p-4 text-center"
								>
									<Card.Content>
										{#await getBookImgUrl(book.url)}
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
							{:else}
								<div class="flex gap-3 mt-8">
									<p class="text-gray-400">No books in this catalogue</p>
									<Button
										on:click={async () => await addBook(catalogue.id!)}
										class="ml-auto shadow-md border-primary border-b-2 border-r-2 active:border-0 active:border-t-2 active:border-l-2"
										>Add Book</Button
									>
								</div>
							{/each}
						</div>
					</section>
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	</main>
</HomeNav>

<!-- dialog for books about -->
<Dialog.Root bind:open={openDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{aboutBook.title}</Dialog.Title>

			<Dialog.Description>
				<p>About</p>
			</Dialog.Description>
			<section>
				<div class="grid grid-cols-2 gap-4 p-6">
					{#if aboutBook.cover_url}
						<img
							class="mb-4 block aspect-[200/250] h-52 object-cover"
							height="250"
							width="200"
							src={aboutBook.cover_url}
							alt="book cover"
						/>
					{:else}
						<Skeleton class=" mb-4 block aspect-[200/250] h-52" />
					{/if}

					<section>
						<div class="flex flex-col gap-2">
							<p class="text-sm text-primary">Author: {aboutBook.author}</p>
							<p class="text-sm text-primary">Publisher: {aboutBook.publisher}</p>
							<p class="text-sm text-primary">Published: {aboutBook.year}</p>
							<p class="text-sm text-primary">Language: {aboutBook.language}</p>
							<p class="text-sm text-primary">Rights: {aboutBook.rights}</p>
						</div>
					</section>
				</div>
				<div class="mt-4 max-h-40 overflow-y-auto p-6">
					{@html aboutBook.description || '<p>No description</p>'}
				</div>
			</section>
		</Dialog.Header>
		<Dialog.Footer>
			<Button class="w-full" variant="default" href="/book{aboutBook.url}">Read</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Toast -->

<div
	class="fixed right-0 top-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-0 md:top-auto"
	use:portal
>
	{#each $toasts as { id, data } (id)}
		<div
			use:melt={$content(id)}
			animate:flip={{ duration: 500 }}
			in:fly={{ duration: 150, x: '100%' }}
			out:fly={{ duration: 150, x: '100%' }}
			class="rounded-lg bg-background text-primary shadow-md ring-2 ring-{data.color}"
		>
			<div
				class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5"
			>
				<div>
					<h3 use:melt={$title(id)} class="flex items-center gap-2 font-semibold">
						{data.title}
						<span class="aspect-square w-2 rounded-full bg-{data.color}" />
					</h3>
					<div use:melt={$description(id)}>
						{data.description}
					</div>
				</div>
				<button
					use:melt={$close(id)}
					class="square-6 hover:bg-magnum-900/50 absolute right-4 top-4 grid place-items-center rounded-full
          text-primary"
				>
					<Cross1 class="aspect-square w-6" />
				</button>
			</div>
		</div>
	{/each}
</div>
