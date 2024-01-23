import Database, { type QueryResult } from "tauri-plugin-sql-api";
import type { BookCard, Catalogue } from "./types";
import { db_path } from "./types";
// import { Book } from "epubjs";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { appDataDir } from '@tauri-apps/api/path';
import { exists } from "@tauri-apps/api/fs";



export async function getCatalogueStore() {
    const db = await Database.load(db_path);
    const catalogues = await db.select<Catalogue[]>("SELECT * FROM catalogues");
    const value = $state(catalogues);


    return {
        value,
        add: async (item: Catalogue) => {

            const result = await db.execute("INSERT INTO catalogues (title) VALUES ($1)", [item.title]);
            if (result.rowsAffected === 1) {
                value.push(item);
                return {
                    status: "success",
                    message: "Catalogue added"
                }
            } else {
                console.error("Failed to add catalogue");
                return {
                    status: "error",
                    message: "Failed to add catalogue"

                }
            }

        },

        remove: async (item: Catalogue) => {

            let result: QueryResult;

            try {
                await db.execute("BEGIN TRANSACTION")
                result = await db.execute("DELETE FROM catalogues WHERE id=$1", [item.id]);
                await db.execute("DELETE FROM books WHERE catalogue_id=$1", [item.id]);
                await db.execute("COMMIT");
            } catch {
                await db.execute("ROLLBACK");
                return {
                    status: "error",
                    message: "Failed to remove catalogue"

                }
            }
            if (result.rowsAffected === 1) {
                value.splice(indexOfCatalogue(value, item), 1);
                return {
                    status: "success",
                    message: "Catalogue removed"
                }
            } else {
                console.error("Failed to remove catalogue");
                return {
                    status: "error",
                    message: "Failed to remove catalogue"

                }
            }
        },
        edit: async (item: Catalogue) => {
            // console.log(item);
            const result = await db.execute("UPDATE catalogues SET title=$1 WHERE id=$2", [item.title, item.id]);
            // console.log(result);
            if (result.rowsAffected === 1) {
                value[indexOfCatalogue(value, item)] = item;
                return {
                    status: "success",
                    message: "Catalogue edited"
                }
            } else {
                console.error("Failed to edit catalogue");
                return {
                    status: "error",
                    message: "Failed to edit catalogue"

                }
            }

        }
    }
}


export async function getBookStore() {
    const db = await Database.load(db_path);
    const books = await db.select<BookCard[]>("SELECT * FROM books");
    const value = $state(books);

    return {
        value,
        add: async (item: BookCard) => {
            if (includesBookCard(value, item)) {
                return {
                    status: "error",
                    message: "Book already exists"
                }
            }
            const result = await db
                .execute("INSERT INTO books (title, author,  description, url, catalogue_id) VALUES ($1, $2, $3, $4, $5)", [item.title, item.author, item.description, item.url, item.catalogue_id]);
            if (result.rowsAffected === 1) {
                value.push(item);
                return {
                    status: "success",
                    message: "Book added"
                }
            } else {
                console.error("Failed to add book");
                return {
                    status: "error",
                    message: "Failed to add book"

                }
            }
        },

        remove: async (item: BookCard) => {
            const result = await db.execute("DELETE FROM books WHERE id=$1", [item.id]);
            if (result.rowsAffected === 1) {
                value.splice(indexOfBookCard(value, item), 1);

                return {
                    status: "success",
                    message: "Book removed"
                }
            } else {
                console.error("Failed to remove book");
                return {
                    status: "error",
                    message: "Failed to remove book"

                }
            }
        },

        getByCatalogue: (catalogue_id: number) => {
            return value.filter(book => book.catalogue_id === catalogue_id);
        }

    }
}

function indexOfBookCard(books: BookCard[], book: BookCard) {
    for (let i = 0; i < books.length; i++) {
        if (books[i].id === book.id) return i;
    }
    return -1;
}

function includesBookCard(books: BookCard[], book: BookCard) {
    for (let i = 0; i < books.length; i++) {
        if (books[i].url === book.url && books[i].catalogue_id === book.catalogue_id) return true;
    }
    return false;
}

// function includesCatalogue(catalogues: Catalogue[], catalogue: Catalogue) {
//     for (let i = 0; i < catalogues.length; i++) {
//         if (catalogues[i].id === catalogue.id) return true;
//     }
//     return false;
// }

function indexOfCatalogue(catalogues: Catalogue[], catalogue: Catalogue) {
    for (let i = 0; i < catalogues.length; i++) {
        if (catalogues[i].id === catalogue.id) return i;
    }
    return -1;
}




export async function getBookImgUrl(book_title: string) {
    const appDataDirPath = await appDataDir();
    const normalized_title = book_title.replace("<", "")
        .replaceAll("\"", "")
        .replaceAll(">", "")
        .replaceAll("?", "")
        .replaceAll("|", "")
        .replaceAll("\\", "")
        .replaceAll("/", "")
        .replaceAll(":", "")
        ;


    const cover_path = appDataDirPath + "cover\\" + normalized_title + ".png";
    const cover_exists = await exists(cover_path);

    if (cover_exists) {
        return convertFileSrc(cover_path);
    } else {
        return "";
    }

    // const path = fixUrl(book_path);
    // const book = new Book(convertFileSrc(path));
    // const cover = await book.coverUrl();
    // if (cover) {

    //     return cover;
    // } else {
    //     return "";
    // }

}
export function fixUrl(url: string) {
    return url.split("%20").join(" ").split("%28").join("(").split("%29").join(")").split("%27").join("'").split("%2C").join(",").split("%26").join("&").split("%5B").join("[").split("%5D").join("]").split("%2B").join("+").split("%21").join("!").split("%3F").join("?").split("%3A").join(":").split("%22").join('"').split("%23").join("#").split("%24").join("$").split("%25").join("%").split("%2A").join("*").split("%2F").join("/").split("%3B").join(";").split("%3D").join("=").split("%3E").join(">").split("%3C").join("<").split("%40").join("@").split("%7E").join("~").split("%60").join("`").split("%7C").join("|").split("%5E").join("^").split("%7B").join("{").split("%7D").join("}").split("%5C").join("\\").split("%3E").join(">").split("%3C").join("<").split("%3B").join(";").split("%3D").join("=").split("%3F").join("?").split("%3A").join(":").split("%22").join('"').split("%23").join("#").split("%24").join("$").split("%25").join("%").split("%2A").join("*").split("%2F").join("/").split("%3B").join(";").split("%3D").join("=").split("%3E").join(">").split("%3C").join("<").split("%40").join("@").split("%7E").join("~").split("%60").join("`").split("%7C").join("|").split("%5E").join("^").split("%7B").join("{").split("%7D").join("}").replace("/C:\\", "C:\\")
}
export type CatalogueStore = ReturnType<typeof getCatalogueStore>;
export type BookStore = ReturnType<typeof getBookStore>;