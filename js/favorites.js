document.addEventListener('DOMContentLoaded', () => {
  fetch('api/favorites.php')
    .then(res => res.json())
    .then(favorites => {
      const container = document.getElementById('favoritesContainer');
      if (favorites.length === 0) {
        container.innerHTML = '<p>You have no favorite shows yet.</p>';
        return;
      }
      let html = '<div class="favorite-grid">';
      favorites.forEach(fav => {
        html += `
          <div class="favorite-card" onclick="window.location.href='show.html?id=${fav.show_id}'">
            <h4>${fav.show_name}</h4>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;
    });
});
