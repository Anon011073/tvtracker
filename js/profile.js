document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('tracked-shows-container');

    // Fetch the user's favorite shows
    fetch('api/favorites.php')
        .then(response => response.json())
        .then(favorites => {
            if (favorites.length === 0) {
                container.innerHTML = '<p>You haven\'t added any shows to your watchlist yet. Find a show and add it to your favorites to start tracking!</p>';
                return;
            }

            favorites.forEach(favorite => {
                // For each favorite, fetch its full details from our own API proxy
                fetch(`api/tmdb.php?endpoint=/tv/${favorite.show_id}`)
                    .then(res => res.json())
                    .then(show => {
                        const showElement = document.createElement('div');
                        showElement.className = 'show-card-full';

                        let seasonsHTML = '';
                        for (let i = 1; i <= show.number_of_seasons; i++) {
                            seasonsHTML += `<div class="season" data-season-number="${i}" data-show-id="${show.id}">Season ${i}</div>`;
                        }

                        showElement.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name}" class="poster">
                            <div class="show-info">
                                <h3>${show.name}</h3>
                                <p>${show.overview.substring(0, 150)}...</p>
                                <a href="watch.html?id=${show.id}" class="btn btn-primary" style="margin-top: 1rem;">▶️ Watch Now</a>
                                <div class="seasons-container">${seasonsHTML}</div>
                                <div class="episodes-container" id="episodes-for-show-${show.id}"></div>
                            </div>
                        `;
                        container.appendChild(showElement);
                    });
            });
        });

    // Event delegation to handle clicks on season elements
    container.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('season')) {
            const seasonNumber = e.target.dataset.seasonNumber;
            const showId = e.target.dataset.showId;
            const episodesContainer = document.getElementById(`episodes-for-show-${showId}`);

            // Toggle visibility
            if (episodesContainer.style.display === 'block') {
                episodesContainer.style.display = 'none';
                return;
            }

            // Fetch season details and render episodes
            fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=b6b677eb7d4ec17f700e3d4dfc31d005`)
                .then(res => res.json())
                .then(seasonData => {
                    fetch(`api/progress.php?show_id=${showId}`)
                        .then(res => res.json())
                        .then(progress => {
                            let episodesHTML = '';
                            seasonData.episodes.forEach(ep => {
                                const isWatched = progress.some(p => p.season_number == seasonNumber && p.episode_number == ep.episode_number);
                                episodesHTML += `
                                    <div class="episode-row">
                                        <input type="checkbox" id="ep-${showId}-${seasonNumber}-${ep.episode_number}" ${isWatched ? 'checked' : ''} onchange="markEpisode(${showId}, ${seasonNumber}, ${ep.episode_number}, this.checked)">
                                        <label for="ep-${showId}-${seasonNumber}-${ep.episode_number}">S${seasonNumber}E${ep.episode_number}: ${ep.name}</label>
                                    </div>
                                `;
                            });
                            episodesContainer.innerHTML = episodesHTML;
                            episodesContainer.style.display = 'block';
                        });
                });
        }
    });
});

function markEpisode(showId, seasonNumber, episodeNumber, watched) {
    fetch('api/progress.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            show_id: showId,
            season_number: seasonNumber,
            episode_number: episodeNumber,
            watched: watched
        })
    });
}
