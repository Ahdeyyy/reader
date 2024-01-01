<script>
	import { Button } from '$lib/components/ui/button';
	import { Home, Gear } from 'radix-icons-svelte';
</script>

<nav class="fixed left-0 top-0 z-50 flex w-full justify-end gap-3 bg-transparent p-1 backdrop-blur">
	<Button variant="ghost" href="/">
		<Home class="aspect-square w-6 md:w-12" />
	</Button>
	<Button variant="ghost" href="/settings">
		<Gear class="aspect-square w-6 md:w-12" />
	</Button>
</nav>

<div class="container relative mx-auto mt-6 p-4 md:p-6">
	<slot />
</div>
