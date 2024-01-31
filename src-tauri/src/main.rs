// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use epub::doc::EpubDoc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::Path;

#[derive(Serialize, Deserialize)]
struct Book {
    title: String,
    author: String,
    description: String,
    rights: String,
    publisher: String,
    date: String,
    language: String,
}

#[tauri::command]
async fn get_book_about(path: String) -> Result<Book, String> {
    let doc = EpubDoc::new(path).map_err(|err| err.to_string())?;
    let mut book = Book {
        title: String::new(),
        author: String::new(),
        description: String::new(),
        rights: String::new(),
        publisher: String::new(),
        date: String::new(),
        language: String::new(),
    };
    let title = doc.mdata("title");
    match title {
        Some(title) => book.title = title,
        None => book.title = String::from(""),
    }
    let author = doc.mdata("creator");
    match author {
        Some(author) => book.author = author,
        None => book.author = String::from(""),
    }
    let description = doc.mdata("description");
    match description {
        Some(description) => book.description = description,
        None => book.description = String::from(""),
    }
    let rights = doc.mdata("rights");
    match rights {
        Some(rights) => book.rights = rights,
        None => book.rights = String::from(""),
    }

    let publisher = doc.mdata("publisher");
    match publisher {
        Some(publisher) => book.publisher = publisher,
        None => book.publisher = String::from(""),
    }
    let date = doc.mdata("date");
    match date {
        Some(date) => book.date = date,
        None => book.date = String::from(""),
    }
    let language = doc.mdata("language");
    match language {
        Some(language) => book.language = language,
        None => book.language = String::from(""),
    }
    Ok(book)
}
fn normalize_title(title: &String) -> String {
    return title
        .replace("<", "")
        .replace("\"", "")
        .replace(":", "")
        .replace(">", "")
        .replace("?", "")
        .replace("|", "")
        .replace("\\", "")
        .replace("/", "");
}

#[tauri::command]
fn generate_image(app_handle: tauri::AppHandle, path: String) -> Result<(), String> {
    //TODO: fix unwraps
    //
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let cover_folder = format!("{}\\cover", app_dir.to_string_lossy().clone());
    if !Path::new(cover_folder.as_str()).exists() {
        fs::create_dir_all(format!("{}\\cover", app_dir.to_string_lossy())).unwrap();
    }
    let mut doc = EpubDoc::new(path).map_err(|err| err.to_string())?;
    let cover = doc.get_cover();
    match cover {
        Ok(cover) => {
            let title = doc.mdata("title").unwrap();
            // remove disallowed characters from the title string
            let normalized_title = normalize_title(&title);
            let cover_path = format!(
                "{}\\cover\\{}.png",
                app_dir.to_string_lossy(),
                normalized_title
            );

            let mut cover_file = fs::File::create(cover_path.clone());
            match cover_file {
                Ok(mut f) => {
                    let _ = f.write_all(&cover);
                }
                Err(_) => {
                    cover_file = fs::File::create(cover_path.clone());

                    match cover_file {
                        Ok(mut f) => {
                            let _ = f.write_all(&cover);
                        }
                        Err(e) => {
                            println!("error creating file, {}", e.to_string());
                            return Err(e.to_string());
                        }
                    }
                }
            }
        }
        Err(e) => return Err(e.to_string()),
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![generate_image])
        .invoke_handler(tauri::generate_handler![get_book_about])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
