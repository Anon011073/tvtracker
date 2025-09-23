// Restored + Updated renderShows function
function renderShows(shows, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  shows.slice(0, 16).forEach(show => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name}" />
      <h3>${show.name}</h3>
      <p>⭐ ${show.vote_average}</p>
    `;
    div.addEventListener('click', () => {
      window.location.href = `show.html?id=${show.id}`;
    });
    container.appendChild(div);
  });
}

// Updated searchShows function in main.js (unified TV + Movie)

// Utility to load shows from TMDB
function loadShows(endpoint, containerId, limit = 16) {
  fetch(`api/tmdb.php?endpoint=${endpoint}`)
    .then(res => res.json())
    .then(data => renderShows(data.results, containerId))
    .catch(err => console.error('Error loading shows:', err));
}

// Load tracked shows from localStorage
function loadTrackedShows() {
  const tracked = JSON.parse(localStorage.getItem('favs') || '[]');
  const container = document.getElementById('trackedShows');
  if (!container || !tracked.length) return;
  container.innerHTML = '';

  tracked.slice(0, 16).forEach(show => {
    fetch(`api/tmdb.php?endpoint=/tv/${show.id}`)
      .then(res => res.json())
      .then(data => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${data.poster_path}" alt="${data.name}" />
          <h3>${data.name}</h3>
          <p>⭐ ${data.vote_average}</p>
        `;
        div.addEventListener('click', () => {
          window.location.href = `show.html?id=${data.id}`;
        });
        container.appendChild(div);
      });
  });
}

function loadGenreShows(genreId) {
  loadShows(`/discover/tv&with_genres=${genreId}`, 'genreSection');
}

document.addEventListener('DOMContentLoaded', () => {
  loadTrackedShows?.();
  loadShows('/tv/popular', 'popular', 16);
  loadShows('/tv/top_rated', 'topRated', 16);
  loadShows('/trending/tv/day', 'trending', 16);

  const genreSelect = document.getElementById('genreSelect');
  if (genreSelect) {
    const savedGenre = localStorage.getItem('selectedGenre') || '80';
    genreSelect.value = savedGenre;
    loadGenreShows(savedGenre);

    genreSelect.addEventListener('change', () => {
      const genreId = genreSelect.value;
      localStorage.setItem('selectedGenre', genreId);
      loadGenreShows(genreId);
    });
  }
});

function searchShows() {
  const query = document.getElementById('searchInput').value.trim();
  const searchSection = document.getElementById('searchSection');
  const movieSection = document.getElementById('movieSection');

  if (!query) {
    searchSection.style.display = 'none';
    if (movieSection) movieSection.style.display = 'none';
    return;
  }

  fetch(`api/tmdb.php?endpoint=/search/tv&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      searchSection.style.display = 'block';
      renderShows(data.results || [], 'searchResults');
    })
    .catch(err => console.error('Search error (TV):', err));

  fetch(`api/tmdb.php?endpoint=/search/movie&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.results?.length) {
        movieSection.style.display = 'block';
        renderMovies(data.results || [], 'movieResults');
      }
    })
    .catch(err => console.error('Search error (Movie):', err));
}

function renderMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  movies.slice(0, 12).forEach(movie => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
      <h3>${movie.title}</h3>
      <p>📅 ${movie.release_date || 'Unknown'}</p>
    `;
    div.addEventListener('click', () => {
      window.location.href = `movie.html?id=${movie.id}`;
    });
    container.appendChild(div);
  });
}

async function watchMovie(tmdbId, title) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=b6b677eb7d4ec17f700e3d4dfc31d005`);
  const data = await res.json();
  const imdbId = data.imdb_id;
  if (!imdbId) return alert('No IMDb ID found.');

  const watched = JSON.parse(localStorage.getItem('watchedMovies') || '[]');
  if (!watched.find(m => m.id === tmdbId)) {
    watched.push({ id: tmdbId, title });
    localStorage.setItem('watchedMovies', JSON.stringify(watched));
  }

  window.open(`se_player.php?video_id=${imdbId}`, '_blank');
}

// Listen for input in search bar
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(searchShows, 400);
  });
}