const apiKey = "0e9b4a28ad9f4f7ab34cae2ff314f548";
const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=5`;

const button = document.getElementById("search_btn");
const receip_list = document.getElementById("receip_list");
const receip_empty = document.getElementById("receip_empty");
const fav = document.getElementById("fav");
const ind_page = document.getElementById("ind_page");
const nav_list = document.getElementById("nav_list");
const search_suggests = document.getElementById("search_suggests");
const search_input = document.getElementById("search_input_in");
const recipes_page = document.getElementById("recipes");
const fav_page = document.getElementById("fav_page");
const fav_empty = document.getElementById("favorites_empty");
const fav_list = document.getElementById("fav_list");

let data = [];
let sorted_arr = [];
let recipeId = "";
let fav_arr = [];

try {
    fav_arr = JSON.parse(localStorage.getItem('favArray')) || [];
} catch (error) {
    console.error("Error parsing favorite recipes from localStorage:", error);
    fav_arr = [];
}

search_input.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    if (val) {
        sorted_arr = data.filter((el) => el.title.toLowerCase().includes(val.toLowerCase()));
        search_suggests.classList.remove("none");
    } else {
        search_suggests.classList.add("none");
    }

    search_suggests.innerHTML = "";

    if (sorted_arr.length > 0) {
        sorted_arr.forEach((recipe) => {
            const suggestionDiv = document.createElement("div");
            suggestionDiv.classList.add("search_suggest");
            suggestionDiv.textContent = recipe.title;
            search_suggests.appendChild(suggestionDiv);
        });
    }
});

fav.addEventListener("click", () => {
    recipes_page.classList.add("none");
});

fav_page.addEventListener("click", (event) => {
    const element = event.target;
    if (element.id === "fav_del") {
        const parent = element.closest(".favorites_item");
        if (parent) {
            fav_arr = fav_arr.filter((f) => f !== parent.id);
            localStorage.setItem('favArray', JSON.stringify(fav_arr));
            fetchFavorites();
        }
    }
});

receip_list.addEventListener("click", async (event) => {
    const element = event.target.closest("[id]");
    if (element && element.id !== "receip_list") {
        recipeId = element.id;
        await fetchIndPage();
    }
});

ind_page.addEventListener("click", (event) => {
    const element = event.target.closest("[id]");
    if (!element) return;

    if (element.id === "back_btn") {
        recipes_page.classList.remove("none");
        ind_page.classList.add("none");
    } else if (element.id === "receip_fav") {
        if (!fav_arr.includes(recipeId)) {
            fav_arr.push(recipeId);
            element.querySelector("img").src = "../assets/icons8-star-active.png";
            element.classList.add("active_fav");
        } else {
            fav_arr = fav_arr.filter((f) => f !== recipeId);
            element.querySelector("img").src = "../assets/icons8-star-50.png";
            element.classList.remove("active_fav");
        }
        localStorage.setItem('favArray', JSON.stringify(fav_arr));
    }
});

nav_list.addEventListener("click", (event) => {
    const element = event.target;
    if (!element) return;

    if (element.id === "fav") {
        fetchFavorites();
        recipes_page.classList.add("none");
        ind_page.classList.add("none");
        fav_page.classList.remove("none");
    } else if (element.id === "home") {
        recipes_page.classList.remove("none");
        ind_page.classList.add("none");
        fav_page.classList.add("none");
    }
});

const addElements = () => {
    receip_list.innerHTML = "";

    if (sorted_arr.length === 0) {
        receip_empty.style.display = "flex";
    } else {
        receip_empty.style.display = "none";
        sorted_arr.forEach((recipe) => {
            const recipeItem = document.createElement("div");
            recipeItem.id = recipe.id;
            recipeItem.classList.add("receip_item");

            recipeItem.innerHTML = `
                <div class="receip_img">
                    <img src="${recipe.image}" alt="${recipe.title}">
                </div>
                <div class="receip_info">
                    <div class="receip_time">
                        <div class="receip_time_text">Time to cook:</div>
                        <div class="time">22:00</div>
                    </div>
                    <div class="receip_short_info">${recipe.title}</div>
                </div>
            `;
            receip_list.appendChild(recipeItem);
        });
    }
};

const fetchReceips = async () => {
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        data = result.results || [];
        sorted_arr = data;
        addElements();
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
};

const fetchIndPage = async () => {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=true`);
        const data = await response.json();

        const recipeSection = document.querySelector(".individual_page");
        const nutrition = data.nutrition?.nutrients || [];
        const ingredients = data.extendedIngredients || [];

        recipeSection.innerHTML = `
            <button class="back" id="back_btn">
                <img src="../assets/icons8-back-50.png" alt="Back">
            </button>
            <div class="first">
                <div class="ind_receip_img">
                    <img src="${data.image}" alt="${data.title}">
                </div>
                <div class="ind_receip_info">
                    <div class="ind_receip_title">${data.title}</div>
                    <div class="ind_receip_instructions">${data.instructions || "No instructions available"}</div>
                    <div class="ind_receip_kall">
                        <div class="kall_text">
                            <div class="kall_tit">Calories:</div>
                            <div class="kall_inf">${nutrition.find((n) => n.name === "Calories")?.amount || 0}</div>
                        </div>
                        <div class="kall_text">
                            <div class="kall_tit">Protein:</div>
                            <div class="kall_inf">${nutrition.find((n) => n.name === "Protein")?.amount || 0} g</div>
                        </div>
                        <div class="kall_text">
                            <div class="kall_tit">Fat:</div>
                            <div class="kall_inf">${nutrition.find((n) => n.name === "Fat")?.amount || 0} g</div>
                        </div>
                    </div>
                    <div class="ind_receip_fav ${fav_arr.includes(recipeId) ? "active_fav" : ""}" id="receip_fav">
                        <img src="${fav_arr.includes(recipeId) ? "../assets/icons8-star-active.png" : "../assets/icons8-star-50.png"}" alt="Favorite">
                    </div>
                </div>
            </div>
            <div class="ingredients">
                <div class="ingredients_title">Ingredients:</div>
                <ul>
                    ${ingredients.map((ing) => `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`).join("")}
                </ul>
            </div>
        `;
        recipes_page.classList.add("none");
        ind_page.classList.remove("none");
    } catch (error) {
        console.error("Error fetching recipe details:", error);
    }
};

const fetchFavorites = () => {
    fav_list.innerHTML = "";
    if (fav_arr.length === 0) {
        fav_empty.style.display = "flex";
        return;
    }
    fav_empty.style.display = "none";

    const favoriteRecipes = data.filter((d) => fav_arr.includes(d.id.toString()));
    favoriteRecipes.forEach((el) => {
        fav_list.innerHTML += `
            <div class="favorites_item" id="${el.id}">
                <div class="fav_delete" id="fav_del">
                    <img src="../assets/icons8-x-48.png" alt="Delete">
                </div>
                <div class="receip_img">
                    <img src="${el.image}" alt="${el.title}">
                </div>
                <div class="receip_info">
                    <div class="receip_time">
                        <div class="receip_time_text">Time to cook:</div>
                        <div class="time">22:00</div>
                    </div>
                    <div class="receip_short_info">${el.title}</div>
                </div>
            </div>
        `;
    });
};

button.addEventListener("click", () => {
    search_suggests.classList.add("none");
    addElements();
});

fetchReceips();
