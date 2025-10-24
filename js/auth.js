document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    fetch('api/session_status.php')
        .then(response => response.json())
        .then(data => {
            let navLinks = `
                <a href="index.html">🏠 Home</a>
                <a href="calendar.html">📅 Calendar</a>
                <a href="newest_episodes.html">🔥 Newest Episodes</a>
                <a href="movies.html">🎬 Movies</a>
            `;

            if (data.loggedIn) {
                navLinks += `
                    <a href="favourites.html">⭐ Favourites</a>
                    <a href="watchlist.html">📋 Watchlist</a>
                    <a href="profile.html">👤 Profile</a>
                    <span style="float: right;">
                        <span id="notification-icon" style="display: none; margin-right: 15px;" title="You have new episode alerts!"></span>
                        <span style="color: white; margin-right: 15px;">Welcome, ${data.username}!</span>
                        <a href="#" id="logoutBtn">Logout</a>
                    </span>
                `;
            } else {
                navLinks += `
                    <span style="float: right;">
                        <a href="login.html">🔑 Login</a>
                    </span>
                `;
            }

            nav.innerHTML = navLinks;

            if (data.loggedIn) {
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function(event) {
                        event.preventDefault();
                        fetch('api/logout.php', { method: 'POST' })
                            .then(() => {
                                window.location.href = 'login.html';
                            });
                    });
                }
            }
        })
        .catch(error => console.error('Error fetching session status:', error));
});
