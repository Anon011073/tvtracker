document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('newest-episodes-container');
  if (!container) return;

  const fetchPage = (page) => {
    return fetch(`api/tmdb.php?endpoint=/tv/top_rated&page=${page}`)
      .then(res => res.json());
  };

  Promise.all([fetchPage(1), fetchPage(2), fetchPage(3)])
    .then(pages => {
      const shows = pages.flatMap(page => page.results);
      const usShows = [];
      const promises = shows.map(show => {
        return fetch(`api/tmdb.php?endpoint=/tv/${show.id}`)
          .then(res => res.json())
          .then(showDetails => {
            if (showDetails && showDetails.origin_country && showDetails.origin_country.includes('US')) {
              usShows.push(show);
            }
          });
      });

      Promise.all(promises).then(() => {
        const episodesByDay = {};
        const episodePromises = usShows.slice(0, 50).map(show => {
          return fetch(`api/tmdb.php?endpoint=/tv/${show.id}`)
            .then(res => res.json())
            .then(showDetails => {
              if (showDetails && showDetails.last_episode_to_air) {
                const episode = showDetails.last_episode_to_air;
                const airDate = new Date(episode.air_date);
                const today = new Date();
                const diffTime = today - airDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 5) { // Only show episodes from the last 5 days
                  return fetch(`api/tmdb.php?endpoint=/tv/${show.id}/season/${episode.season_number}/episode/${episode.episode_number}/external_ids`)
                    .then(res => res.json())
                    .then(externalIds => {
                      if (externalIds && externalIds.imdb_id) {
                        const airDateStr = airDate.toDateString();
                        if (!episodesByDay[airDateStr]) {
                          episodesByDay[airDateStr] = [];
                        }
                        episodesByDay[airDateStr].push({
                          show_id: show.id,
                          season_number: episode.season_number,
                          episode_number: episode.episode_number,
                          name: episode.name,
                          still_path: episode.still_path,
                          show_name: show.name
                        });
                      }
                    });
                }
              }
            });
        });

        Promise.all(episodePromises).then(() => {
          const sortedDays = Object.keys(episodesByDay).sort((a, b) => new Date(b) - new Date(a));

          for (const day of sortedDays) {
            const dayContainer = document.createElement('div');
            dayContainer.className = 'day-container';

            const heading = document.createElement('h2');
            const airDate = new Date(day);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (airDate.toDateString() === today.toDateString()) {
              heading.textContent = 'Aired Today';
            } else if (airDate.toDateString() === yesterday.toDateString()) {
              heading.textContent = 'Aired Yesterday';
            } else {
              heading.textContent = `Aired ${day}`;
            }

            dayContainer.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'show-grid';
            dayContainer.appendChild(grid);

            episodesByDay[day].forEach(episode => {
              const card = document.createElement('div');
              card.className = 'card';
              card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w200${episode.still_path}" alt="${episode.name}" />
                <h3>${episode.show_name}</h3>
                <p>${episode.name}</p>
                <p>Season ${episode.season_number}, Episode ${episode.episode_number}</p>
                <a href="watch.html?id=${episode.show_id}&s=${episode.season_number}&e=${episode.episode_number}" class="btn">Watch Now</a>
              `;
              grid.appendChild(card);
            });

            container.appendChild(dayContainer);
          }
        });
      });
    })
    .catch(err => console.error('Error loading newest episodes:', err));
});
