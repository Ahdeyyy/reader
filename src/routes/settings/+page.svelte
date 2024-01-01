<script lang="ts">
	import { getCatalogueStore, type CatalogueStore } from '$lib/store/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { fly } from 'svelte/transition';
	import { Cross1, Trash } from 'radix-icons-svelte';
	import { confirm } from '@tauri-apps/api/dialog';
	import type { Catalogue } from '$lib/store/types';
	import HomeNav from '$lib/components/custom/homeNav.svelte';

	let catalogueStore: Awaited<CatalogueStore> | undefined = $state(undefined);

	getCatalogueStore().then((store) => {
		catalogueStore = store;
	});

	let catalogueInput = $state(false);
	let catalogueTitle = $state('');

	async function addCatalogue(input: string) {
		if (!input) return;
		await catalogueStore?.add({
			title: input
		});
	}

	async function removeCatalogue(catalogue: Catalogue) {
		if (catalogue.title === 'recent' && catalogue.id === 1) return; // TODO: toast (cannot remove recent catalogue
		const confirmed = await confirm('This action cannot be reverted. Are you sure?', {
			title: 'Remove catalogue',
			type: 'warning'
		});
		if (!confirmed) return;
		await catalogueStore?.remove(catalogue);
		// TODO: confirmation toast
	}
	async function editCatalogue(catalogue: Catalogue) {
		if (!catalogue.title) return;
		await catalogueStore?.edit(catalogue);
		// TODO: confirmation toast
	}
</script>

<HomeNav>
	<main class="mt-4 grid gap-3">
		<h1 class="text-center text-xl font-bold md:text-2xl">Settings</h1>
		<section class="grid gap-4">
			<h2 class="text-lg font-semibold">Catalogues</h2>
			<div class="w-full">
				{#if !catalogueInput}
					<div
						class="w-1/5"
						in:fly={{ x: -150, delay: 350, duration: 300 }}
						out:fly={{ x: -150, duration: 300 }}
					>
						<Button
							class="w-full"
							on:click={() => {
								catalogueInput = true;
							}}
							variant="default"
						>
							Create
						</Button>
					</div>
				{/if}
				{#if catalogueInput}
					<form
						in:fly={{ x: 150, delay: 350, duration: 300 }}
						out:fly={{ x: 150, duration: 300 }}
						class="flex w-3/5 justify-evenly gap-4"
						on:submit|preventDefault={async () => {
							await addCatalogue(catalogueTitle);
							catalogueInput = false;
						}}
					>
						<Input
							autofocus={true}
							bind:value={catalogueTitle}
							placeholder="Enter title"
							type="text"
						/>
						<div class="flex w-1/5 justify-around gap-2">
							<Button
								type="reset"
								on:click={() => {
									catalogueInput = false;
								}}
								variant="default"
							>
								<Cross1 class="aspect-square w-6 md:w-8" />
							</Button>
							<Button type="submit" variant="default">Add</Button>
						</div>
					</form>
				{/if}
			</div>
			{#each catalogueStore?.value || [] as catalogue}
				<article class="flex w-3/5 justify-between gap-2 rounded-md px-5 py-2 shadow-md">
					<Input
						type="text"
						name="catalogue-{catalogue.id}"
						bind:value={catalogue.title}
						id="catalogue-{catalogue.title}"
					/>
					<Button
						on:click={async () => {
							await editCatalogue(catalogue);
						}}
						variant="default">Edit</Button
					>
					<div>
						<Button
							on:click={async () => {
								await removeCatalogue(catalogue);
							}}
							variant="destructive"
						>
							<Trash class="aspect-square w-6 md:w-8" />
						</Button>
					</div>
				</article>
			{/each}
		</section>
	</main>
</HomeNav>
