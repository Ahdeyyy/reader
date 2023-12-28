export type BookCard = {
    id?: number;
    title: string;
    author: string;
    cover?: string;
    description: string;
    url: string;
    catalogue_id: number;

};

export type Catalogue = {
    id?: number;
    title: string;
}

export const db_path = "sqlite:books9.db";