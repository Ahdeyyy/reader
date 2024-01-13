import type { LayoutLoad } from './$types';
import { migrate } from '$lib/store/migrate';

export const load = (async () => {
    await migrate();
    return {};
}) satisfies LayoutLoad;

export const ssr = false;
export const csr = true;
// export const prerender = true;