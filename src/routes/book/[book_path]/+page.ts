import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
    return {
        path: params.book_path,
    };
}) satisfies PageLoad;

export const prerender = false;