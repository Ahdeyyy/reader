<script lang="ts">
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	import { Book, type NavItem } from 'epubjs';
	import ePub from 'epubjs';
	import type { RenditionOptions } from 'epubjs/types/rendition';
	import { Slider } from '$lib/components/ui/slider';
	import ReaderNav from '$lib/components/custom/readerNav.svelte';
	import { debounce } from '$lib/utils.js';
	import * as Sheet from '$lib/components/ui/sheet';
	import { ChevronLeft, ChevronRight } from 'radix-icons-svelte';
	import { Button } from '$lib/components/ui/button';

	type Flow = 'auto' | 'paginated' | 'scrolled-doc' | 'scrolled' | undefined;

	const { data } = $props();
	const { path } = data;
	const flow: Flow = 'scrolled';

	// console.log(data);
	// const book = new Book(convertFileSrc(path), {});

	const book = new Book(convertFileSrc(path), {});

	const renditionOpts: RenditionOptions = {
		flow,
		width: '100%',
		height: '100%',
		allowScriptedContent: true
	};

	const rendition = book.renderTo('area', renditionOpts);

	const location = localStorage.getItem(`${path}-location`);
	let toc = $state<NavItem[]>([]);

	// let current_page: number = $state(0);
	// let total_pages: number = $state(0);

	// Setup

	async function epub_setup() {
		await book.locations.generate(1024); // Example using 1024 characters per page
		book.loaded.navigation.then((data) => {
			toc = data.toc;
		});
		if (location) {
			// const loc = book.locations.load(location);

			const loc = JSON.parse(location);
			rendition.location = loc;
			await rendition.display(loc.end.href);
			console.log('loc', loc);
		} else {
			await rendition.display();
		}
	}

	// On location change

	rendition.on('locationChanged', async (location) => {
		const cur_location = rendition.currentLocation();
		// console.log('cur', cur_location);
		// console.log('loc', rendition.location);

		localStorage.setItem(`${path}-location`, JSON.stringify(cur_location));
		// console.log(book.locations.save());
		// current_page = location.start.displayed.page;
		// total_pages = location.end.displayed.page;
	});

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

	$effect(() => {
		(async () => {
			await epub_setup();
		})();

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
		<main class="relative max-h-[100vh] max-w-[100vw] overflow-x-clip">
			<Button
				on:click={goLeft}
				variant="secondary"
				class=" absolute left-4 top-1/3 z-50 px-4 py-14 opacity-25 transition-all duration-500 hover:opacity-100"
			>
				<ChevronLeft class="h-6 w-6 " />
			</Button>
			<Button
				on:click={goRight}
				variant="secondary"
				class=" absolute right-4 top-1/3 z-50 px-4 py-14 opacity-25 transition-all duration-500 hover:opacity-100"
			>
				<ChevronRight class="h-6 w-6" />
			</Button>
			<section class="flex h-[89lvh] w-[85lwh] justify-center overflow-x-clip" id="area"></section>

			<!-- <Slider value={[current_page]} max={100} step={1} /> -->
		</main>
	</ReaderNav>
{/if}
