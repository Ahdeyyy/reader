<script lang="ts">
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import { Book, type NavItem } from 'epubjs';
	import ePub from 'epubjs';
	import type { RenditionOptions } from 'epubjs/types/rendition';
	import { Slider } from '$lib/components/ui/slider';
	import ReaderNav from '$lib/components/custom/readerNav.svelte';
	import { debounce } from '$lib/utils.js';
	import * as Sheet from '$lib/components/ui/sheet';
	import { ListBullet } from 'radix-icons-svelte';
	import { Button } from '$lib/components/ui/button';

	type Flow = 'auto' | 'paginated' | 'scrolled-doc' | 'scrolled' | undefined;

	const { data } = $props();
	const { path } = data;
	const flow: Flow = 'paginated';

	// console.log(data);
	// const book = new Book(convertFileSrc(path), {});

	const book = $state(new Book(convertFileSrc(path), {}));

	const renditionOpts: RenditionOptions = {
		flow,
		width: '100%',
		height: '100%',
		allowScriptedContent: true
	};

	const rendition = book.renderTo('area', renditionOpts);

	const location = localStorage.getItem(`${path}-location`);
	let toc = $state<NavItem[]>([]);

	if (location) {
		book.locations.load(location);

		book.rendition.display();
	}
	// let current_page: number = $state(0);
	// let total_pages: number = $state(0);
	const rtl = false;
	const goLeft = rtl ? () => rendition.next() : () => rendition.prev();
	const goRight = rtl ? () => rendition.prev() : () => rendition.next();
	const onwheel = debounce(
		(event: WheelEvent) => {
			const { deltaX, deltaY } = event;
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				if (deltaX > 0) goRight();
				else if (deltaX < 0) goLeft();
			} else {
				if (deltaY > 0) rendition.next();
				else if (deltaY < 0) rendition.prev();
			}
			event.preventDefault();
		},
		100,
		true
	);

	book.loaded.navigation.then((data) => {
		toc = data.toc;
	});
	rendition.on('locationChanged', async (location) => {
		await book.locations.generate(1024); // Example using 1024 characters per page

		localStorage.setItem(`${path}-location`, book.locations.save());
		// console.log(book.locations.save());
		// current_page = location.start.displayed.page;
		// total_pages = location.end.displayed.page;
	});

	$effect(() => {
		// (async () => {
		// 	await rendition.display();
		// })();

		// console.log(document.documentElement.addEventListener);

		document.addEventListener('keyup', async (event: KeyboardEvent) => {
			// console.log(event.target);
			if (event.key === 'ArrowLeft') {
				await rendition.prev();
			} else if (event.key === 'ArrowRight') {
				await rendition.next();
			} else if (event.key === 'ArrowUp') {
				console.log(rendition.currentLocation());
			}
		});

		const iframe = document.querySelector('iframe');

		// if the iframe is clicked on, focus back to the main document
		// let i = document
		// 	.querySelector('#area')!
		// 	.addEventListener('click', () => document.querySelector('main')!.focus());

		// document.documentElement.addEventListener('wheel', (event: WheelEvent) => {
		// 	console.log('wheeling');
		// 	onwheel(event);
		// });
		// document.onwheel = onwheel;

		// return () => {
		// 	document.removeEventListener('keyup', async (event: KeyboardEvent) => {
		// 		if (event.key === 'ArrowLeft') {
		// 			await rendition.prev();
		// 		} else if (event.key === 'ArrowRight') {
		// 			await rendition.next();
		// 		} else if (event.key === 'ArrowUp') {
		// 			console.log(rendition.currentLocation());
		// 		}
		// 	});

		// 	document
		// 		.querySelector('#area')
		// 		?.removeEventListener('click', () => document.querySelector('main')!.focus());
		// };
	});
</script>

{#if toc.length > 0}
	<ReaderNav {book} tableOfContents={toc}>
		<main class="relative max-h-[100vh] max-w-[100vw]">
			<section class="flex h-[88lvh] w-[85lwh] justify-center overflow-x-clip" id="area"></section>
			<div class="flex justify-items-end"></div>
			<!-- <Slider value={[current_page]} max={100} step={1} /> -->
		</main>
	</ReaderNav>
{/if}
