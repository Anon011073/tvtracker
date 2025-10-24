document.addEventListener('DOMContentLoaded', () => {
  fetch('api/session_status.php')
    .then(res => res.json())
    .then(data => {
      const nav = document.querySelector('nav');
      let navHtml = `
        <a href="index.html">🏠 Home</a>
        <a href="calendar.html">📅 Calendar</a>
        <a href="newest_episodes.html">🔥 Newest Episodes</a>
        <a href="favourites.html">❤️ Favourites</a>
      `;
      if (data.loggedIn) {
        navHtml += `<span style="float: right;">Welcome, ${data.username} | <a href="#" id="logoutBtn">Logout</a></span>`;
      } else {
        navHtml += `<span style="float: right;"><a href="login.html">🔑 Login</a> | <a href="register.html">📝 Register</a></span>`;
      }
      nav.innerHTML = navHtml;

      if (data.loggedIn) {
        document.getElementById('logoutBtn').addEventListener('click', () => {
          fetch('api/logout.php').then(() => location.reload());
        });
      }
    });

  if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const messageEl = document.getElementById('message');

      fetch('api/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'login', username, password })
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(res => {
        messageEl.textContent = res.body.message;
        if (res.status === 200) {
          messageEl.style.color = 'green';
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          messageEl.style.color = 'red';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        messageEl.textContent = 'An unexpected error occurred.';
        messageEl.style.color = 'red';
      });
    });
  }

  if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(event) {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const messageEl = document.getElementById('message');

      fetch('api/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'register', username, email, password })
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(res => {
        messageEl.textContent = res.body.message;
        if (res.status === 201) {
          messageEl.style.color = 'green';
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        } else {
          messageEl.style.color = 'red';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        messageEl.textContent = 'An unexpected error occurred.';
        messageEl.style.color = 'red';
      });
    });
  }
});
