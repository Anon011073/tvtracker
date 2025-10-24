document.addEventListener('DOMContentLoaded', () => {
  fetch('api/notifications.php')
    .then(res => res.json())
    .then(notifications => {
      const container = document.getElementById('notificationsContainer');
      if (!container) return;

      if (notifications.length === 0) {
        container.innerHTML = '<p>No new episodes in the next 24 hours.</p>';
        return;
      }

      let html = '<ul>';
      notifications.forEach(n => {
        html += `<li><strong>${n.show_name}</strong>: ${n.episode_name} airs on ${n.air_date}</li>`;
      });
      html += '</ul>';
      container.innerHTML = html;
    });
});
