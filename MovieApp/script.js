const apiKey = "e3c610562a600c8c43953aceb986bb76";
const baseURL = "https://api.themoviedb.org/3";

const searchInput = document.getElementById("searchInput");
const moviesGrid = document.getElementById("moviesGrid");
const movieModal = document.getElementById("movieModal");
const movieDetails = document.getElementById("movieDetails");
const closeModalBtn = document.getElementById("closeModal");
const sortByPopularity = document.getElementById("sort-popularity");
const sortByRelease = document.getElementById("sort-release");
const sortByRating = document.getElementById("sort-rating");
const showWatchlist = document.getElementById("show-watchlist");

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

// Fetch Movies
const fetchMovies = async (query = "", sort = "popularity.desc") => {
    console.log("Fetching movies with query:", query, "and sort:", sort); // Debugging
    try {
        const url = query
            ? `${baseURL}/search/movie?query=${query}&api_key=${apiKey}`
            : `${baseURL}/discover/movie?sort_by=${sort}&api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Failed to fetch movies:", error);
    }
};

// Display Movies
const displayMovies = (movies) => {
    console.log("Displaying movies:", movies); // Debugging
    moviesGrid.innerHTML = movies.map((movie) => `
        <div class="movie-card">
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button onclick="fetchMovieDetails(${movie.id})">Details</button>
        </div>
    `).join("");
};

// Fetch Movie Details
const fetchMovieDetails = async (movieId) => {
    console.log("Fetching details for movie ID:", movieId); // Debugging
    try {
        const movieResponse = await fetch(`${baseURL}/movie/${movieId}?api_key=${apiKey}`);
        const creditsResponse = await fetch(`${baseURL}/movie/${movieId}/credits?api_key=${apiKey}`);
        if (!movieResponse.ok || !creditsResponse.ok) {
            throw new Error("Failed to fetch movie details.");
        }
        const movie = await movieResponse.json();
        const credits = await creditsResponse.json();
        showModal(movie, credits);
    } catch (error) {
        console.error("Failed to fetch movie details:", error);
        alert("Unable to fetch movie details. Please try again later.");
    }
};

// Show Modal with Detailed Info and Watchlist Option
const showModal = (movie, credits) => {
    console.log("Showing modal for movie:", movie); // Debugging
    const isInWatchlist = watchlist.some((item) => item.id === movie.id);

    const genres = movie.genres.map((genre) => genre.name).join(", ");
    const cast = credits.cast.slice(0, 5).map((actor) => actor.name).join(", ") || "Not available";

    movieDetails.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
        <p><strong>Overview:</strong> ${movie.overview || "Not available"}</p>
        <p><strong>Genres:</strong> ${genres || "Not available"}</p>
        <p><strong>Release Date:</strong> ${movie.release_date || "Not available"}</p>
        <p><strong>Runtime:</strong> ${movie.runtime || "Unknown"} minutes</p>
        <p><strong>Cast:</strong> ${cast}</p>
        <p><strong>Rating:</strong> ${movie.vote_average || "Not available"}</p>
        <button id="watchlist-btn">${isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}</button>
    `;
    movieModal.classList.remove("hidden");

    document.getElementById("watchlist-btn").onclick = () => toggleWatchlist(movie);
};

// Toggle Watchlist
const toggleWatchlist = (movie) => {
    const index = watchlist.findIndex((item) => item.id === movie.id);
    if (index === -1) {
        watchlist.push(movie);
        showToast(`${movie.title} added to watchlist`);
    } else {
        watchlist.splice(index, 1);
        showToast(`${movie.title} removed from watchlist`);
    }
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    showModal(movie); // Refresh modal to update button text
};

// Close Modal
closeModalBtn.addEventListener("click", () => {
    movieModal.classList.add("hidden");
});

// Sorting Buttons
sortByPopularity.addEventListener("click", () => fetchMovies("", "popularity.desc"));
sortByRelease.addEventListener("click", () => fetchMovies("", "release_date.desc"));
sortByRating.addEventListener("click", () => fetchMovies("", "vote_average.desc"));

// Show Watchlist
showWatchlist.addEventListener("click", () => displayMovies(watchlist));

// Search Movies
searchInput.addEventListener("input", (e) => fetchMovies(e.target.value.trim()));

// Toast Notification
const showToast = (message) => {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    document.getElementById("toast-container").appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Fetch Default Movies on Page Load
fetchMovies();
