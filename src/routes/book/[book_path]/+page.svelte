<script lang="ts">
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import { Book } from 'epubjs';
	import type { RenditionOptions } from 'epubjs/types/rendition';

	const { data } = $props();
	const { path } = data;
	console.log(data);

	let book = $state(new Book(convertFileSrc(path), {}));
	const renditionOpts: RenditionOptions = {
		flow: 'paginated',
		width: '100%',
		height: '100%',
		allowScriptedContent: true
	};
	(() => {
		book.loaded.resources.then(async () => {
			// console.log('book loaded');

			// console.log(await book.loaded);
			const rendition = book.renderTo('area', renditionOpts);
			rendition.display();
		});
	})();

	const nextPage = async () => {
		book.rendition.next();
	};
	const prevPage = async () => {
		book.rendition.prev();
	};
</script>

<main class="container mx-auto grid grid-cols-2 p-3">
	<div>
		<button on:click={nextPage}> next page </button>
		<button on:click={prevPage}> prev page </button>
	</div>
	<section class="aspect-square h-96" id="area"></section>
</main>
