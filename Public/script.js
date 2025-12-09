const API_URL = "http://localhost:3000/movies";

const form = document.getElementById('add-movie-form');
const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');

let allMovies = [];

function fetchMovies() {
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error("Failed to load movies");
            return res.json();
        })
        .then(data => {
            allMovies = data;
            displayMovies(data);
        })
        .catch(err => console.error("Error fetching movies:", err));
}


function displayMovies(movies) {
    movieListDiv.innerHTML = "";

    if (movies.length === 0) {
        movieListDiv.innerHTML = `<p style="color:#666;">No movies found.</p>`;
        return;
    }

    movies.forEach(movie => {
        const div = document.createElement("div");
        div.className = "movie-item";
        div.dataset.id = movie.id;

        div.innerHTML = `
            <strong>${movie.title}</strong> (${movie.year})<br>
            <small>${movie.genre || "No Genre"}</small>
            <div class="actions">
                <button data-action="edit">✏ Edit</button>
                <button data-action="delete">🗑 Delete</button>
            </div>
        `;

        movieListDiv.appendChild(div);
    });
}


form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const genre = document.getElementById('genre').value.trim();
    const year = parseInt(document.getElementById('year').value, 10);

    if (!title || !year) return alert("Title and Year are required");

    const newMovie = { title, genre, year };

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie),
    })
        .then(res => res.json())
        .then(() => {
            form.reset();
            fetchMovies();
        })
        .catch(err => console.error("Error adding movie:", err));
});

movieListDiv.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (!action) return;

    const movieItem = e.target.closest(".movie-item");
    const id = movieItem.dataset.id;
    const movie = allMovies.find(m => m.id == id);

    if (action === "delete") {
        if (!confirm(`Delete "${movie.title}"?`)) return;

        fetch(`${API_URL}/${id}`, { method: "DELETE" })
            .then(() => fetchMovies())
            .catch(err => console.error("Error deleting movie:", err));
    }

    if (action === "edit") {
        const newTitle = prompt("New title:", movie.title);
        if (newTitle === null) return;

        const newYear = prompt("New year:", movie.year);
        if (newYear === null) return;

        const newGenre = prompt("New genre:", movie.genre);
        if (newGenre === null) return;

        const updated = {
            id: movie.id,
            title: newTitle.trim(),
            year: parseInt(newYear, 10),
            genre: newGenre.trim()
        };

        fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        })
            .then(() => fetchMovies())
            .catch(err => console.error("Error updating movie:", err));
    }
});


searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allMovies.filter(m =>
        m.title.toLowerCase().includes(term) ||
        (m.genre && m.genre.toLowerCase().includes(term))
    );

    displayMovies(filtered);
});


// Load movies initially
fetchMovies();