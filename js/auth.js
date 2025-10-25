document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    fetch('api/session_status.php')
        .then(response => response.json())
        .then(data => {
            let baseNavLinks = `
                <a href="index.html">🏠 Home</a>
                <a href="calendar.html">📅 Calendar</a>
                <a href="upcoming_episodes.html">🔥 Upcoming Episodes</a>
                <a href="movies.html">🎬 Movies</a>
            `;

            if (data.loggedIn) {
                // User is logged in, fetch notifications before rendering the final nav
                fetch('api/notifications.php')
                    .then(res => res.json())
                    .then(notifications => {
                        let profileLink = '<a href="profile.html">👤 Profile</a>';
                        if (notifications.length > 0) {
                            profileLink += `<span class="notification-badge">${notifications.length}</span>`;
                        }

                        const loggedInNavLinks = `
                            ${baseNavLinks}
                            <a href="watchlist.html">📋 Watchlist</a>
                            ${profileLink}
                            <span style="float: right;">
                                <span style="color: white; margin-right: 15px;">Welcome, ${data.username}!</span>
                                <a href="#" id="logoutBtn">Logout</a>
                            </span>
                        `;

                        nav.innerHTML = loggedInNavLinks;

                        // Attach logout button event listener
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
                    });
            } else {
                // User is not logged in, render simple nav
                const loggedOutNavLinks = `
                    ${baseNavLinks}
                    <span style="float: right;">
                        <a href="login.html">🔑 Login</a>
                    </span>
                `;
                nav.innerHTML = loggedOutNavLinks;
            }
        })
        .catch(error => console.error('Error fetching session status:', error));
});
