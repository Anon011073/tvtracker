// File: js/show.js
const params = new URLSearchParams(window.location.search);
const showId = params.get('id');

document.addEventListener('DOMContentLoaded', () => {
  fetchShowDetails(showId);
  setupTheme();
});

function setupTheme() {
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
}

function fetchShowDetails(id) {
  fetch(`api/tmdb.php?endpoint=/tv/${id}`)
    .then(res => res.json())
    .then(show => {
      renderShowDetails(show);
      loadCast(id);
      loadReviews(id);
      loadRecommendations(id);
    })
    .catch(error => console.error('Error fetching show details:', error));
}

function renderShowDetails(show) {
  const container = document.getElementById('showDetails');

  container.innerHTML = `
    <section class="hero">
      <img src="https://image.tmdb.org/t/p/w300${show.poster_path}" alt="${show.name}" class="poster" />
      <div class="hero-text">
        <h1>${show.name}</h1>
        <p>${show.overview}</p>
        <p><strong>Status:</strong> ${show.status}</p>
        <p><strong>Seasons:</strong> ${show.number_of_seasons}</p>

        <div class="btn-group">
          <button id="favBtn" class="btn">❤️ Loading...</button>
          <button id="caughtUpBtn" class="btn btn-secondary">✅ Mark as Caught Up</button>
          <button id="resetBtn" class="btn btn-danger">🗑️ Reset Progress</button>
          <a class="btn btn-primary" href="watch.html?id=${show.id}" target="_blank">▶️ Watch Now</a>
        </div>
        <p><em>Last watched air date: ${caughtUpDate}</em></p>
      </div>
    </section>

    <section id="cast"></section>
    <section id="reviews"></section>
    <section id="recommendations"></section>
    <section id="episodes"></section>
  `;

  const favBtn = document.getElementById('favBtn');
  fetch('api/favorites.php')
    .then(res => res.json())
    .then(favorites => {
      const isFav = favorites.some(f => f.show_id === show.id);
      favBtn.textContent = isFav ? '❌ Remove from Favourites' : '❤️ Add to Favourites';
      favBtn.addEventListener('click', () => toggleFavourite(show.id, show.name, !isFav));
    });

  document.getElementById('caughtUpBtn').addEventListener('click', () => markCaughtUp(show.id));
  document.getElementById('resetBtn').addEventListener('click', () => resetProgress(show.id));

  for (let season = 1; season <= show.number_of_seasons; season++) {
    fetch(`api/tmdb.php?endpoint=/tv/${show.id}/season/${season}`)
      .then(res => res.json())
      .then(seasonData => renderEpisodes(show.id, season, seasonData.episodes));
  }
}


function loadCast(id) {
  fetch(`api/tmdb.php?endpoint=/tv/${id}/credits`)
    .then(res => res.json())
    .then(data => {
      const castDiv = document.getElementById('cast');
      castDiv.innerHTML = '<h3>🎭 Cast</h3>' +
        '<div class="cast-list">' +
        data.cast.slice(0, 6).map(c =>
          `<div class="cast-card">${c.name}<br><small>as ${c.character}</small></div>`
        ).join('') + '</div>';
    });
}

function loadReviews(id) {
  fetch(`api/tmdb.php?endpoint=/tv/${id}/reviews`)
    .then(res => res.json())
    .then(data => {
      const reviewDiv = document.getElementById('reviews');
      if (data.results.length > 0) {
        reviewDiv.innerHTML = '<h3>📝 Reviews</h3>' +
          data.results.slice(0, 3).map(r =>
            `<div class="review">
              <strong>${r.author}</strong><p>${r.content.substring(0, 200)}...</p>
            </div>`
          ).join('');
      }
    });
}

function loadRecommendations(id) {
  fetch(`api/tmdb.php?endpoint=/tv/${id}/recommendations`)
    .then(res => res.json())
    .then(data => {
      const recDiv = document.getElementById('recommendations');
      if (data.results.length > 0) {
        recDiv.innerHTML = '<h3>🔁 You might also like these</h3>' +
          '<div class="recommendation-grid">' +
          data.results.slice(0, 8).map(show => `
            <div class="rec-card" onclick="window.location.href='show.html?id=${show.id}'">
              <img src="https://image.tmdb.org/t/p/w154${show.poster_path}" alt="${show.name}" />
              <h4>${show.name}</h4>
            </div>
          `).join('') + '</div>';
      }
    });
}

function renderEpisodes(showId, seasonNumber, episodes) {
  const container = document.getElementById('episodes');
  const seasonId = `season-${showId}-${seasonNumber}`;

  fetch(`api/progress.php?show_id=${showId}`)
    .then(res => res.json())
    .then(progress => {
      let html = `
        <div class="season-block">
          <h3 onclick="toggleSeason('${seasonId}')">📂 Season ${seasonNumber} (click to expand)</h3>
          <div id="${seasonId}" class="season-body" style="display:none;">
      `;

      episodes.forEach(ep => {
        const watched = progress.some(p => p.season_number === seasonNumber && p.episode_number === ep.episode_number);
        html += `
          <div class="episode-row">
            <input type="checkbox" id="ep-${seasonNumber}-${ep.episode_number}" ${watched ? 'checked' : ''}
              onchange="markEpisode(${showId}, ${seasonNumber}, ${ep.episode_number}, this.checked)">
            <label for="ep-${seasonNumber}-${ep.episode_number}">S${seasonNumber}E${ep.episode_number}: ${ep.name}</label>
          </div>
        `;
      });

      html += `</div></div>`;
      container.innerHTML += html;
    });
}

function toggleFavourite(id, name, addToFavorites) {
  const url = addToFavorites ? 'api/favorites.php' : `api/favorites.php?show_id=${id}`;
  const method = addToFavorites ? 'POST' : 'DELETE';
  const body = addToFavorites ? JSON.stringify({ show_id: id, show_name: name }) : null;

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: body
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    location.reload();
  })
  .catch(error => {
    console.error('Error toggling favorite:', error);
    alert('An error occurred.');
  });
}

function markCaughtUp(showId) {
  fetch(`api/tmdb.php?endpoint=/tv/${showId}`)
    .then(res => res.json())
    .then(show => {
      const promises = [];
      for (let s = 1; s <= show.number_of_seasons; s++) {
        promises.push(fetch(`api/tmdb.php?endpoint=/tv/${showId}/season/${s}`).then(r => r.json()));
      }
      Promise.all(promises).then(seasons => {
        const episodes = [];
        seasons.forEach(season => {
          season.episodes.forEach(ep => {
            episodes.push({
              season_number: season.season_number,
              episode_number: ep.episode_number
            });
          });
        });

        fetch('api/progress.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bulk_update: true,
            show_id: showId,
            episodes: episodes
          })
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          location.reload();
        });
      });
    });
}

function resetProgress(showId) {
  fetch(`api/progress.php?show_id=${showId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      location.reload();
    });
}

function markEpisode(showId, seasonNumber, episodeNumber, watched) {
  fetch('api/progress.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      show_id: showId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      watched: watched ? 1 : 0
    })
  });
}

function toggleSeason(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

function setupTheme() {
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
}
