import Database from "tauri-plugin-sql-api";
import { db_path, type Catalogue } from "./types";
// import type { BookCard, Catalogue } from "./types";


export const migrate = async () => {
    // change this to your database path afterwards
    const db = await Database.load(db_path);

    // create the tables
    await db.execute(
        `CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            description TEXT NOT NULL,
            url TEXT NOT NULL,
            catalogue_id INTEGER NOT NULL
        )`
    );

    await db.execute(
        `CREATE TABLE IF NOT EXISTS catalogues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL
        )`
    );

    // add a recent catalogue if it doesn't exist
    const catalogue = await db.select<Catalogue[]>("SELECT * FROM catalogues WHERE title='recent'");

    if (catalogue.length === 0) {
        await db.execute(
            `INSERT INTO catalogues (title) VALUES ('recent')`
        );
    }


}