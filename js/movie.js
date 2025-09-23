// File: js/movie.js

const TMDB_KEY = 'b6b677eb7d4ec17f700e3d4dfc31d005';
const params = new URLSearchParams(window.location.search);
const movieId = params.get('id');

if (movieId) fetchMovieDetails(movieId);

function fetchMovieDetails(id) {
  fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`)
    .then(res => res.json())
    .then(renderMovieDetails);
}

function renderMovieDetails(movie) {
  const container = document.getElementById('movieDetails');
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : '';

  container.innerHTML = `
    <section class="hero">
      <img src="${poster}" alt="${movie.title}" class="poster">
      <div class="hero-text">
        <h1>${movie.title}</h1>
        <p>${movie.overview}</p>
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Rating:</strong> ⭐ ${movie.vote_average}</p>
        <div class="btn-group">
          <button class="btn btn-primary" onclick="watchMovie(${movie.id}, '${movie.title.replace(/'/g, "\'")}')">▶️ Watch Now</button>
        </div>
      </div>
    </section>
  `;
}

async function watchMovie(tmdbId, title) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${TMDB_KEY}`);
  const data = await res.json();
  const imdbId = data.imdb_id;
  if (!imdbId) return alert('No IMDb ID found.');

  const watched = JSON.parse(localStorage.getItem('watchedMovies') || '[]');
  if (!watched.find(m => m.id === tmdbId)) {
    watched.push({ id: tmdbId, title });
    localStorage.setItem('watchedMovies', JSON.stringify(watched));
  }

  window.location.href = `watch.html?id=${tmdbId}&type=movie`;
}

// Theme toggle
const toggleBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.add(savedTheme + '-mode');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    document.body.classList.remove(isDark ? 'dark-mode' : 'light-mode');
    document.body.classList.add(isDark ? 'light-mode' : 'dark-mode');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });
}
