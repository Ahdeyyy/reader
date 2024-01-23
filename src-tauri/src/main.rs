// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use epub::doc::EpubDoc;
use std::fs;
use std::io::Write;

#[tauri::command]
fn generate_image(app_handle: tauri::AppHandle, path: String) -> Result<(), String> {
    //TODO: fix unwraps
    let mut doc = EpubDoc::new(path).map_err(|err| err.to_string())?;
    let cover = doc.get_cover();
    match cover {
        Ok(cover) => {
            let title = doc.mdata("title").unwrap();
            // remove disallowed characters from the title string
            let normalized_title = title
                .replace("<", "")
                .replace("\"", "")
                .replace(":", "")
                .replace(">", "")
                .replace("?", "")
                .replace("|", "")
                .replace("\\", "")
                .replace("/", "");
            let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
            let cover_path = format!(
                "{}\\cover\\{}.png",
                app_dir.to_string_lossy(),
                normalized_title
            );
            // println!("{}", cover_path);
            let mut cover_file = fs::File::create(cover_path.clone());
            match cover_file {
                Ok(mut f) => {
                    let _ = f.write_all(&cover);
                }
                Err(_) => {
                    fs::create_dir_all(format!("{}\\cover", app_dir.to_string_lossy())).unwrap();
                    cover_file = fs::File::create(cover_path);

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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
