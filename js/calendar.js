document.addEventListener('DOMContentLoaded', () => {
  loadCalendar();
});

function loadCalendar() {
  const favs = JSON.parse(localStorage.getItem('favs') || '[]');
  const container = document.getElementById('calendarContainer');
  container.innerHTML = '<p>📡 Loading upcoming episodes...</p>';

  const promises = favs.map(show =>
    fetch(`api/tmdb.php?endpoint=/tv/${show.id}`)
      .then(res => res.json())
      .then(data => {
        const nextEp = data.next_episode_to_air;
        if (!nextEp) return null;
        return {
          name: show.name,
          episode: `S${nextEp.season_number}E${nextEp.episode_number} - ${nextEp.name}`,
          air_date: nextEp.air_date,
          showId: show.id
        };
      })
  );

  Promise.all(promises).then(episodes => {
    const filtered = episodes.filter(e => e);
    renderCalendar(filtered);
  });
}

function renderCalendar(episodes) {
  const container = document.getElementById('calendarContainer');
  if (!episodes.length) {
    container.innerHTML = '<p>No upcoming episodes found for your tracked shows.</p>';
    return;
  }

  // Group episodes by air_date
  const eventsByDate = {};
  episodes.forEach(ep => {
    if (!eventsByDate[ep.air_date]) eventsByDate[ep.air_date] = [];
    eventsByDate[ep.air_date].push(ep);
  });

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const numDays = lastDay.getDate();
  const startDay = (firstDay.getDay() + 6) % 7; // Make Monday = 0

  const monthName = firstDay.toLocaleString('default', { month: 'long' });

  // Start building calendar HTML
  let html = `<h2>${monthName} ${year}</h2>`;
  html += '<div class="calendar-grid-view">';

  // Add weekday headers
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  weekdays.forEach(day => {
    html += `<div class="calendar-header">${day}</div>`;
  });

  // Empty cells before 1st
  for (let i = 0; i < startDay; i++) {
    html += `<div class="calendar-day empty"></div>`;
  }

  // Render each day
  for (let d = 1; d <= numDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const eps = eventsByDate[dateStr] || [];

    let inner = `<strong>${d}</strong>`;
    eps.forEach(ep => {
      inner += `
        <div class="ep-tile">
          <a href="show.html?id=${ep.showId}">
            ${ep.name}<br><small>${ep.episode}</small>
          </a>
        </div>
      `;
    });

    html += `<div class="calendar-day ${eps.length ? 'has-ep' : ''}">${inner}</div>`;
  }

  // Fill trailing empty days to complete grid
  const totalCells = startDay + numDays;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < remaining; i++) {
    html += `<div class="calendar-day empty"></div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}
