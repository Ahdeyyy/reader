<script lang="ts">
	import { addToast } from '$lib/components/custom/toast';
	import { getCatalogueStore, type CatalogueStore } from '$lib/store/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	import { Cross1, Trash, Pencil1, Check } from 'radix-icons-svelte';
	import { confirm } from '@tauri-apps/api/dialog';
	import type { Catalogue } from '$lib/store/types';
	import HomeNav from '$lib/components/custom/homeNav.svelte';

	let catalogueStore: Awaited<CatalogueStore> | undefined = $state(undefined);

	getCatalogueStore().then((store) => {
		catalogueStore = store;
	});

	let catalogueTitle = $state('');

	async function addCatalogue(input: string) {
		if (!input) return;
		if (!catalogueStore) return;
		const status = await catalogueStore.add({
			title: input
		});

		addToast({
			data: {
				title: status.status,
				description: status.message,
				color: status.status === 'success' ? 'green-500' : 'red-500'
			}
		});
	}

	async function removeCatalogue(catalogue: Catalogue) {
		if (catalogue.title === 'recent' && catalogue.id === 1) return;
		// TODO: toast (cannot remove recent catalogue

		const confirmed = await confirm('This action cannot be reverted. Are you sure?', {
			title: 'Remove catalogue',
			type: 'warning'
		});
		if (!confirmed) return;
		if (!catalogueStore) return;
		const status = await catalogueStore.remove(catalogue);
		addToast({
			data: {
				title: status.status,
				description: status.message,
				color: status.status === 'success' ? 'green-500' : 'red-500'
			}
		});
	}
	async function editCatalogue(catalogue: Catalogue) {
		if (!catalogue.title) return;
		if (!catalogueStore) return;
		const status = await catalogueStore?.edit(catalogue);
		addToast({
			data: {
				title: status.status,
				description: status.message,
				color: status.status === 'success' ? 'green-500' : 'red-500'
			}
		});
	}
</script>

<HomeNav>
	<main class="mt-4 grid gap-3">
		<h1 class="text-center text-xl font-bold md:text-2xl">Settings</h1>
		<section class="grid gap-4">
			<h2 class="text-lg font-semibold">Catalogues</h2>
			<div class="w-full">
				<form
					class="flex w-3/5 justify-evenly gap-4"
					on:submit|preventDefault={async () => {
						await addCatalogue(catalogueTitle);
						catalogueTitle = '';
					}}
				>
					<Input
						autofocus={true}
						bind:value={catalogueTitle}
						placeholder="Enter title"
						type="text"
					/>
					<div class="">
						<Button type="submit" variant="default">
							<Check class="aspect-square w-6 md:w-8" />
						</Button>
					</div>
				</form>
			</div>
			{#each catalogueStore?.value || [] as catalogue}
				<article class="flex w-3/5 justify-between gap-2 rounded px-5 py-2 shadow-md">
					<Input
						type="text"
						name="catalogue-{catalogue.id}"
						bind:value={catalogue.title}
						id="catalogue-{catalogue.title}"
						class="h-full py-2"
						disabled={catalogue.id === 1 && catalogue.title === 'recent'}
					/>
					<Button
						on:click={async () => {
							await editCatalogue(catalogue);
						}}
						variant="default"
						disabled={catalogue.id === 1 && catalogue.title === 'recent'}
					>
						<Pencil1 class="aspect-square w-6 md:h-8" />
					</Button>
					<div>
						<Button
							on:click={async () => {
								await removeCatalogue(catalogue);
							}}
							variant={catalogue.id === 1 ? 'ghost' : 'destructive'}
							disabled={catalogue.id === 1 && catalogue.title === 'recent'}
						>
							<Trash class="aspect-square w-6 md:w-8" />
						</Button>
					</div>
				</article>
			{/each}
		</section>
	</main>
</HomeNav>
