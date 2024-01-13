<script lang="ts">
	import { content, close, description, portal, toasts, title } from './toast';
	import { melt } from '@melt-ui/svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { Cross1 } from 'radix-icons-svelte';
</script>

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
			<!-- so tailwind generates this classes (the background and ring ones) -->
			<p class="hidden bg-red-500 ring-red-500">i</p>
			<p class="hidden bg-green-500 ring-green-500">j</p>
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
					class="absolute right-4 top-4 grid aspect-square w-6 place-items-center rounded-full text-primary
          hover:bg-primary/50"
				>
					<Cross1 class="aspect-square w-6" />
				</button>
			</div>
		</div>
	{/each}
</div>
