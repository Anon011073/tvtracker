// File: js/watch.js

const TMDB_KEY = 'b6b677eb7d4ec17f700e3d4dfc31d005';
const params = new URLSearchParams(window.location.search);
const showId = params.get('id');
const contentType = params.get('type') || 'tv'; // default to 'tv'

const iframe = document.getElementById('iframe');
const movieTitle = document.getElementById('movieTitle');
const episodeList = document.getElementById('episodeList');

if (showId) {
  if (contentType === 'movie') {
    loadMovie(showId);
  } else {
    loadEpisodes(showId);
  }
}

async function loadMovie(id) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/external_ids?api_key=${TMDB_KEY}`);
  const data = await res.json();
  const imdbId = data.imdb_id;

  if (imdbId) {
    iframe.src = `se_player.php?video_id=${imdbId}`;
    const details = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`);
    const info = await details.json();
    movieTitle.textContent = info.title || 'Now Playing';
    episodeList.style.display = 'none';
  } else {
    movieTitle.textContent = 'IMDb ID not found for this movie.';
  }
}

async function loadEpisodes(id) {
  const stored = JSON.parse(localStorage.getItem('resumeEpisodes') || '{}');
  const last = stored[id];
  const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}`);
  const show = await response.json();

  const imdbIdRes = await fetch(`https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${TMDB_KEY}`);
  const imdbData = await imdbIdRes.json();
  const imdbId = imdbData.imdb_id;

  movieTitle.textContent = show.name;
  episodeList.innerHTML = '';

  let firstLoaded = false;
  for (let season = 1; season <= show.number_of_seasons; season++) {
    const seasonRes = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${TMDB_KEY}`);
    const seasonData = await seasonRes.json();

    const seasonHeading = document.createElement('div');
    seasonHeading.className = 'season-heading';
    seasonHeading.textContent = `Season ${season}`;

    const seasonContainer = document.createElement('div');
    seasonContainer.className = 'season-container';

    seasonHeading.onclick = () => {
      seasonContainer.classList.toggle('active');
    };

    seasonData.episodes.forEach(episode => {
      const epDiv = document.createElement('div');
      epDiv.className = 'episode';
      epDiv.textContent = `S${season}E${episode.episode_number}: ${episode.name}`;
      epDiv.onclick = () => {
        iframe.src = `se_player.php?video_id=${imdbId}&s=${season}&e=${episode.episode_number}`;
        movieTitle.textContent = `${show.name} - S${season}E${episode.episode_number}`;
        stored[id] = { s: season, e: episode.episode_number };
        localStorage.setItem('resumeEpisodes', JSON.stringify(stored));
      };

      // auto-load last watched or first episode
      if (!firstLoaded && ((last && last.s === season && last.e === episode.episode_number) || (!last && season === 1 && episode.episode_number === 1))) {
        epDiv.click();
        firstLoaded = true;
      }
      seasonContainer.appendChild(epDiv);
    });

    episodeList.appendChild(seasonHeading);
    episodeList.appendChild(seasonContainer);
  }
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
