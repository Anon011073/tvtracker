document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('upcoming-episodes-container');

    fetch('api/notifications.php')
        .then(response => response.json())
        .then(notifications => {
            if (notifications.length === 0) {
                container.innerHTML = '<p>No upcoming episodes for your favorite shows in the next 24 hours.</p>';
                return;
            }

            let html = '';
            notifications.forEach(n => {
                html += `
                    <div class="episode-item">
                        <h3>${n.show_name}</h3>
                        <p>${n.episode_string}</p>
                        <p><strong>Airs:</strong> ${n.air_date} (${n.status})</p>
                    </div>
                `;
            });
            container.innerHTML = html;
        });
});
