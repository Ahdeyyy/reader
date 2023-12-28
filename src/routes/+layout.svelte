<script>
	import { Button } from '$lib/components/ui/button';
	import { CardStack, Gear } from 'radix-icons-svelte';
	import '../app.pcss';
</script>

<nav
	class="fixed left-0 top-0 z-50 mb-12 flex w-full justify-end gap-3 bg-transparent p-4 backdrop-blur-md md:p-6"
>
	<Button variant="ghost" href="/">
		<CardStack class="aspect-square w-6 md:w-12" />
	</Button>
	<Button variant="ghost" href="/settings">
		<Gear class="aspect-square w-6 md:w-12" />
	</Button>
</nav>

<div class="container relative mx-auto mt-9 p-4 md:p-6">
	<slot />
</div>
