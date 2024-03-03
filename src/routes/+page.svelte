<script lang="ts">
	// TODO: function and type renames, need to be more descriptive
	import { Book } from 'epubjs';
	import { Plus } from 'radix-icons-svelte';
	import * as Tabs from '$lib/components/ui/tabs';

	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { open } from '@tauri-apps/api/dialog';
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import { Skeleton } from '$lib/components/ui/skeleton';

	import { confirm } from '@tauri-apps/api/dialog';

	import HomeNav from '$lib/components/custom/homeNav.svelte';

	import BookCardComponent from './bookCard.svelte';

	import {
		getBookStore,
		getCatalogueStore,
		type CatalogueStore,
		type BookStore,
		getBookImgUrl,
		fixUrl
	} from '$lib/store/store.svelte';
	import type { BookCard } from '$lib/store/types';
	import { addToast } from '$lib/components/custom/toast';
	import SearchCatalogue from '$lib/components/custom/searchCatalogue.svelte';
	import { invoke } from '@tauri-apps/api/tauri';

	type DialogState = 'closed' | 'open' | 'opening';
	let aboutDialogState: DialogState = $state<DialogState>('closed');

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
			const book_url = new URL(t_file_path).pathname;
			const metadata = await epub_book.loaded.metadata;

			const book: BookCard = {
				title: metadata.title,
				author: metadata.creator,
				description: metadata.description,
				url: book_url,
				catalogue_id: catalogue_id
			};

			const status = await bookStore!.add(book);
			if (status.status === 'success') {
				await invoke('generate_image', { path: file_path as string });
			}
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
		type About = {
			title: string;
			description: string;
			author: string;
			publisher: string;
			date: string;
			language: string;
			rights: string;
		};
		try {
			const about = (await invoke('get_book_about', { path: fixUrl(book_path) })) as About;
			aboutBook.title = about.title;
			aboutBook.description = about.description;
			aboutBook.author = about.author;
			aboutBook.publisher = about.publisher;
			aboutBook.url = book_path;
			aboutBook.rights = about.rights;

			aboutBook.language = about.language;
			if (about.date === '') {
				aboutBook.year = 'Unknown';
			} else {
				const date = new Date(about.date);
				aboutBook.year =
					date.getFullYear().toString() +
					'-' +
					(date.getMonth() + 1).toString() +
					'-' +
					date.getDate().toString();
			}
		} catch (e) {
			addToast({
				data: {
					title: 'Error',
					description: e as string,
					color: 'red-500'
				}
			});
		}

		openDialog = true;
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
								<BookCardComponent {book} {removeBook} {openAbout}></BookCardComponent>
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
					{#await getBookImgUrl(aboutBook.title)}
						<Skeleton class="mx-auto mb-4 h-52" />
					{:then url}
						{#if url}
							<img
								class="mx-auto mb-4 aspect-[200/250] h-52 object-cover"
								height="250"
								width="200"
								src={url}
								alt="book cover"
							/>
						{:else}
							<Skeleton class="mx-auto mb-4 h-52" />
						{/if}
					{:catch error}
						<p>{error}</p>
					{/await}

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
