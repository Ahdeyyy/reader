export function createCategoryItem(name: string) {
    const currentState = stringToStringArray(localStorage.getItem(name) || "[]");
    const value = $state(currentState)

    return {
        name,
        value,
        add: (item: string) => {
            if (value.includes(item)) return;
            value.push(item);
            localStorage.setItem(name, JSON.stringify(value));
        },
        remove: (item: string) => {
            value.splice(value.indexOf(item), 1);
            localStorage.setItem(name, JSON.stringify(value));
        },
        reset: () => {
            value.splice(0, value.length);
            localStorage.setItem(name, JSON.stringify(value));
        }
    }

}


export function loadCategories() {
    let categories = localStorage.getItem("categories");

    const defaultCategories = ["recent"]
    if (!categories) {
        localStorage.setItem("categories", JSON.stringify(defaultCategories));
    }
    categories = localStorage.getItem("categories");
    const value = $state(stringToStringArray(categories || "[]"));

    return {
        value,
        add: (item: string) => {
            if (value.includes(item)) return;
            value.push(item);
            localStorage.setItem("categories", JSON.stringify(value));
        },
        remove: (item: string) => {
            value.splice(value.indexOf(item), 1);
            localStorage.setItem("categories", JSON.stringify(value));
        },
        reset: () => {
            value.splice(0, value.length);
            value.push("recent");
            localStorage.setItem("categories", JSON.stringify(value));
        }
    }


}

function stringToStringArray(str: string) {
    try {
        return JSON.parse(str) as string[];
    }
    catch (e) {
        console.error(e);
        return [];
    }
}

export type Categories = ReturnType<typeof loadCategories>;
export type CategoryItem = ReturnType<typeof createCategoryItem>;


